'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Listing = {
  id: string
  jastiper_id: string
  title: string
  description: string | null
  trip_country: string
  arrival_date: string
  max_weight_kg: number | null
  product_name: string
  product_url: string | null
  product_price_idr: number
  service_fee_idr: number
  shipping_fee_idr: number
  total_price_idr: number
  status: string
  created_at: string
  jastiper: {
    full_name: string
    avatar_url: string | null
    whatsapp_number: string | null
  } | null
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysLeft(date: string) {
  const diff = new Date(date).getTime() - Date.now()
  const days = Math.ceil(diff / 1000 / 60 / 60 / 24)
  if (days < 0) return { label: 'Sudah tiba', urgent: false }
  if (days === 0) return { label: 'Tiba hari ini', urgent: true }
  if (days <= 3) return { label: `${days} hari lagi`, urgent: true }
  return { label: `${days} hari lagi`, urgent: false }
}

export default function BrowseListingsPage() {
  const supabase = createClient()
  const router = useRouter()

  const [listings, setListings] = useState<Listing[]>([])
  const [allListings, setAllListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCountry, setFilterCountry] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'arrival_soon'>('newest')
  const [selected, setSelected] = useState<Listing | null>(null)
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [orderSuccess, setOrderSuccess] = useState('')
  const [userId, setUserId] = useState('')
  const [countries, setCountries] = useState<string[]>([])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      fetchListings(user.id)
    }
    init()
  }, [])

  useEffect(() => {
    let filtered = [...allListings]

    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(l =>
        l.title?.toLowerCase().includes(q) ||
        l.product_name?.toLowerCase().includes(q) ||
        l.trip_country?.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q)
      )
    }

    if (filterCountry) {
      filtered = filtered.filter(l => l.trip_country === filterCountry)
    }

    if (sortBy === 'price_low') {
      filtered.sort((a, b) => a.total_price_idr - b.total_price_idr)
    } else if (sortBy === 'arrival_soon') {
      filtered.sort((a, b) => new Date(a.arrival_date).getTime() - new Date(b.arrival_date).getTime())
    } else {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    setListings(filtered)
  }, [search, filterCountry, sortBy, allListings])

  async function fetchListings(uid: string) {
    setLoading(true)

    const { data } = await supabase
      .from('listings')
      .select('id, jastiper_id, title, description, trip_country, arrival_date, max_weight_kg, product_name, product_url, product_price_idr, service_fee_idr, shipping_fee_idr, total_price_idr, status, created_at, jastiper:jastiper_id(full_name, avatar_url)')
      .eq('status', 'open')
      .neq('jastiper_id', uid) // jangan tampilkan listing sendiri
      .order('created_at', { ascending: false })

    if (!data) { setListings([]); setLoading(false); return }

    // ambil whatsapp_number jastiper terpisah
    const jastiperIds = [...new Set(data.map((l: any) => l.jastiper_id).filter(Boolean))]
    let waMap: Record<string, string | null> = {}

    if (jastiperIds.length > 0) {
      const { data: jpData } = await supabase
        .from('jastiper_profiles')
        .select('user_id, whatsapp_number')
        .in('user_id', jastiperIds)
      ;(jpData ?? []).forEach((jp: any) => { waMap[jp.user_id] = jp.whatsapp_number })
    }

    const mapped = data.map((l: any) => ({
      ...l,
      jastiper: l.jastiper ? {
        full_name: l.jastiper.full_name,
        avatar_url: l.jastiper.avatar_url,
        whatsapp_number: waMap[l.jastiper_id] ?? null,
      } : null,
    }))

    // ambil unique countries untuk filter
    const uniqueCountries = [...new Set(mapped.map((l: any) => l.trip_country).filter(Boolean))]
    setCountries(uniqueCountries as string[])

    setAllListings(mapped)
    setListings(mapped)
    setLoading(false)
  }

  async function handleOrder() {
    if (!selected || !userId) return
    setOrderLoading(true)
    setOrderError('')

    const platformFee = Math.round(selected.total_price_idr * 0.05)
    const total = selected.total_price_idr + platformFee

    // buat order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: userId,
        jastiper_id: selected.jastiper_id,
        listing_id: selected.id,
        flow_type: 'flow_b',
        product_url: selected.product_url,
        product_name: selected.product_name,
        quantity: 1,
        delivery_pref: 'courier', // default courier, bisa dikembangkan
        status: 'waiting_payment',
      })
      .select('id')
      .single()

    if (orderError) {
      setOrderError('Gagal membuat order: ' + orderError.message)
      setOrderLoading(false)
      return
    }

    // buat order_pricing
    await supabase.from('order_pricing').insert({
      order_id: orderData.id,
      product_price_idr: selected.product_price_idr,
      service_fee_idr: selected.service_fee_idr,
      shipping_fee_idr: selected.shipping_fee_idr,
      platform_fee_idr: platformFee,
      estimated_customs_idr: 0,
      total_idr: total,
    })

    // buat escrow
    await supabase.from('escrow_transactions').insert({
      order_id: orderData.id,
      amount_idr: total,
      status: 'held',
    })

    setOrderSuccess(`Order berhasil dibuat! Total yang harus dibayar: ${formatRupiah(total)}`)
    setSelected(null)
    setOrderLoading(false)
  }

  return (
    <div className="max-w-2xl">

      {/* Modal order */}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Konfirmasi Order</h2>
              <button onClick={() => { setSelected(null); setOrderError('') }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Listing info */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="font-medium text-gray-900 dark:text-white text-sm mb-1">{selected.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{selected.product_name} · {selected.trip_country}</p>
              </div>

              {/* Jastiper info */}
              {selected.jastiper && (
                <div className="flex items-center gap-3">
                  {selected.jastiper.avatar_url ? (
                    <img src={selected.jastiper.avatar_url} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-semibold text-blue-600 dark:text-blue-300 uppercase">
                      {selected.jastiper.full_name?.[0] ?? '?'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.jastiper.full_name}</p>
                    <p className="text-xs text-gray-400">Jastiper</p>
                  </div>
                </div>
              )}

              {/* Rincian harga */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Harga produk</span>
                  <span>{formatRupiah(selected.product_price_idr)}</span>
                </div>
                {selected.service_fee_idr > 0 && (
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Service fee</span>
                    <span>{formatRupiah(selected.service_fee_idr)}</span>
                  </div>
                )}
                {selected.shipping_fee_idr > 0 && (
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Ongkir</span>
                    <span>{formatRupiah(selected.shipping_fee_idr)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Platform fee (5%)</span>
                  <span>{formatRupiah(Math.round(selected.total_price_idr * 0.05))}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white pt-1.5 border-t border-gray-200 dark:border-gray-700">
                  <span>Total yang dibayar</span>
                  <span>{formatRupiah(selected.total_price_idr + Math.round(selected.total_price_idr * 0.05))}</span>
                </div>
              </div>

              {orderError && <p className="text-red-500 text-sm">{orderError}</p>}

              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Setelah order dibuat, kamu akan diarahkan ke halaman pembayaran. Upload bukti transfer untuk diverifikasi admin.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { setSelected(null); setOrderError('') }}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleOrder}
                  disabled={orderLoading}
                  className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {orderLoading ? 'Memproses...' : 'Order Sekarang'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Browse Listing</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Temukan jastiper yang sesuai kebutuhanmu</p>
      </div>

      {/* Success toast */}
      {orderSuccess && (
        <div className="mb-5 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-green-700 dark:text-green-300">{orderSuccess}</p>
          <button onClick={() => { setOrderSuccess(''); router.push('/orders') }} className="text-green-500 ml-4 text-xs underline">
            Lihat pesanan →
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Cari produk, negara, atau jastiper..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <select
          value={filterCountry}
          onChange={e => setFilterCountry(e.target.value)}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none focus:border-gray-500"
        >
          <option value="">Semua negara</option>
          {countries.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none focus:border-gray-500"
        >
          <option value="newest">Terbaru</option>
          <option value="price_low">Harga terendah</option>
          <option value="arrival_soon">Tiba paling cepat</option>
        </select>

        <div className="flex items-center ml-auto">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {listings.length} listing{listings.length !== allListings.length ? ` dari ${allListings.length}` : ''}
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada listing yang tersedia</p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map(listing => {
            const dl = daysLeft(listing.arrival_date)
            return (
              <div key={listing.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                {/* Jastiper info */}
                <div className="flex items-center gap-2 mb-4">
                  {listing.jastiper?.avatar_url ? (
                    <img src={listing.jastiper.avatar_url} className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-300 uppercase">
                      {listing.jastiper?.full_name?.[0] ?? '?'}
                    </div>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400">{listing.jastiper?.full_name}</p>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <p className="text-xs text-gray-400">{formatDate(listing.created_at)}</p>
                </div>

                {/* Title & product */}
                <div className="mb-4">
                  <p className="font-semibold text-gray-900 dark:text-white mb-0.5">{listing.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{listing.product_name}</p>
                  {listing.product_url && (
                    <a href={listing.product_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                      Lihat produk →
                    </a>
                  )}
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Negara</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{listing.trip_country}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Tiba</p>
                    <p className={`text-sm font-medium ${dl.urgent ? 'text-orange-500' : 'text-gray-900 dark:text-white'}`}>
                      {dl.label}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Max berat</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{listing.max_weight_kg ? `${listing.max_weight_kg} kg` : '-'}</p>
                  </div>
                </div>

                {listing.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-4">"{listing.description}"</p>
                )}

                {/* Harga + tombol */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-xs text-gray-400">Total harga</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatRupiah(listing.total_price_idr)}</p>
                    <p className="text-xs text-gray-400">+5% platform fee</p>
                  </div>
                  <button
                    onClick={() => { setSelected(listing); setOrderError('') }}
                    className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-all"
                  >
                    Order Sekarang
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}