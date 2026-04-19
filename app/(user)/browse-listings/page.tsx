'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Trip = {
  id: string
  jastiper_id: string
  title: string
  description: string | null
  trip_country: string
  arrival_date: string
  image_url: string | null
  status: string
  created_at: string
  jastiper: {
    full_name: string
    avatar_url: string | null
    whatsapp_number: string | null
  } | null
  products: Product[]
}

type Product = {
  id: string
  product_name: string
  product_url: string | null
  image_url: string | null
  product_price_idr: number
  service_fee_idr: number
  shipping_fee_idr: number
  total_price_idr: number
  stock: number
  status: string
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

  const [trips, setTrips] = useState<Trip[]>([])
  const [allTrips, setAllTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCountry, setFilterCountry] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'arrival_soon'>('newest')
  const [countries, setCountries] = useState<string[]>([])
  const [userId, setUserId] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<{ product: Product; trip: Trip } | null>(null)
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [orderSuccess, setOrderSuccess] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      fetchTrips(user.id)
    }
    init()
  }, [])

  useEffect(() => {
    let filtered = [...allTrips]

    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(t =>
        t.title?.toLowerCase().includes(q) ||
        t.trip_country?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.products.some(p => p.product_name?.toLowerCase().includes(q))
      )
    }

    if (filterCountry) {
      filtered = filtered.filter(t => t.trip_country === filterCountry)
    }

    if (sortBy === 'arrival_soon') {
      filtered.sort((a, b) => new Date(a.arrival_date).getTime() - new Date(b.arrival_date).getTime())
    } else {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    setTrips(filtered)
  }, [search, filterCountry, sortBy, allTrips])

  async function fetchTrips(uid: string) {
    setLoading(true)

    const { data: tripsData } = await supabase
      .from('trips')
      .select('id, jastiper_id, title, description, trip_country, arrival_date, image_url, status, created_at, jastiper:jastiper_id(full_name, avatar_url)')
      .eq('status', 'open')
      .neq('jastiper_id', uid)
      .order('created_at', { ascending: false })

    if (!tripsData || tripsData.length === 0) { setTrips([]); setAllTrips([]); setLoading(false); return }

    // ambil whatsapp_number jastiper terpisah
    const jastiperIds = [...new Set(tripsData.map((t: any) => t.jastiper_id).filter(Boolean))]
    let waMap: Record<string, string | null> = {}

    if (jastiperIds.length > 0) {
      const { data: jpData } = await supabase
        .from('jastiper_profiles')
        .select('user_id, whatsapp_number')
        .in('user_id', jastiperIds)
      ;(jpData ?? []).forEach((jp: any) => { waMap[jp.user_id] = jp.whatsapp_number })
    }

    // ambil produk per trip
    const tripIds = tripsData.map((t: any) => t.id)
    const { data: productsData } = await supabase
      .from('listings')
      .select('id, trip_id, product_name, product_url, image_url, product_price_idr, service_fee_idr, shipping_fee_idr, total_price_idr, stock, status')
      .in('trip_id', tripIds)
      .eq('status', 'open')

    const productsMap: Record<string, Product[]> = {}
    ;(productsData ?? []).forEach((p: any) => {
      if (!productsMap[p.trip_id]) productsMap[p.trip_id] = []
      productsMap[p.trip_id].push(p)
    })

    const mapped = tripsData
      .map((t: any) => ({
        ...t,
        jastiper: t.jastiper ? {
          full_name: t.jastiper.full_name,
          avatar_url: t.jastiper.avatar_url,
          whatsapp_number: waMap[t.jastiper_id] ?? null,
        } : null,
        products: productsMap[t.id] ?? [],
      }))
      .filter((t: any) => t.products.length > 0) // hanya tampilkan trip yang punya produk

    const uniqueCountries = [...new Set(mapped.map((t: any) => t.trip_country).filter(Boolean))]
    setCountries(uniqueCountries as string[])
    setAllTrips(mapped)
    setTrips(mapped)
    setLoading(false)
  }

  async function handleOrder() {
    if (!selectedProduct || !userId) return
    setOrderLoading(true)
    setOrderError('')

    const { product, trip } = selectedProduct
    const platformFee = Math.round(product.total_price_idr * 0.05)
    const total = product.total_price_idr + platformFee

    const { data: orderData, error: orderErr } = await supabase
      .from('orders')
      .insert({
        buyer_id: userId,
        jastiper_id: trip.jastiper_id,
        listing_id: product.id,
        flow_type: 'flow_b',
        product_url: product.product_url,
        product_name: product.product_name,
        quantity: 1,
        delivery_pref: 'courier',
        status: 'waiting_payment',
      })
      .select('id')
      .single()

    if (orderErr) { setOrderError('Gagal membuat order: ' + orderErr.message); setOrderLoading(false); return }

    await supabase.from('order_pricing').insert({
      order_id: orderData.id,
      product_price_idr: product.product_price_idr,
      service_fee_idr: product.service_fee_idr,
      shipping_fee_idr: product.shipping_fee_idr,
      platform_fee_idr: platformFee,
      estimated_customs_idr: 0,
      total_idr: total,
    })

    await supabase.from('escrow_transactions').insert({
      order_id: orderData.id,
      amount_idr: total,
      status: 'held',
    })

    setOrderSuccess(`Order berhasil! Total: ${formatRupiah(total)}`)
    setSelectedProduct(null)
    setOrderLoading(false)
  }

  return (
    <div className="max-w-2xl">

      {/* Modal order */}
      {selectedProduct && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Konfirmasi Order</h2>
              <button onClick={() => { setSelectedProduct(null); setOrderError('') }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Product info */}
              <div className="flex gap-3">
                {selectedProduct.product.image_url ? (
                  <img src={selectedProduct.product.image_url} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{selectedProduct.product.product_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedProduct.trip.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedProduct.trip.trip_country} · Tiba {formatDate(selectedProduct.trip.arrival_date)}</p>
                </div>
              </div>

              {/* Jastiper */}
              {selectedProduct.trip.jastiper && (
                <div className="flex items-center gap-2">
                  {selectedProduct.trip.jastiper.avatar_url ? (
                    <img src={selectedProduct.trip.jastiper.avatar_url} className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-300 uppercase">
                      {selectedProduct.trip.jastiper.full_name?.[0] ?? '?'}
                    </div>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedProduct.trip.jastiper.full_name}</p>
                </div>
              )}

              {/* Rincian harga */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Harga produk</span>
                  <span>{formatRupiah(selectedProduct.product.product_price_idr)}</span>
                </div>
                {selectedProduct.product.service_fee_idr > 0 && (
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Service fee</span>
                    <span>{formatRupiah(selectedProduct.product.service_fee_idr)}</span>
                  </div>
                )}
                {selectedProduct.product.shipping_fee_idr > 0 && (
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Ongkir</span>
                    <span>{formatRupiah(selectedProduct.product.shipping_fee_idr)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Platform fee (5%)</span>
                  <span>{formatRupiah(Math.round(selectedProduct.product.total_price_idr * 0.05))}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white pt-1.5 border-t border-gray-200 dark:border-gray-700">
                  <span>Total</span>
                  <span>{formatRupiah(selectedProduct.product.total_price_idr + Math.round(selectedProduct.product.total_price_idr * 0.05))}</span>
                </div>
              </div>

              {orderError && <p className="text-red-500 text-sm">{orderError}</p>}

              <div className="flex gap-2">
                <button onClick={() => { setSelectedProduct(null); setOrderError('') }} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                  Batal
                </button>
                <button onClick={handleOrder} disabled={orderLoading} className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all">
                  {orderLoading ? 'Memproses...' : 'Order Sekarang'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Browse Trip</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Temukan jastiper yang siap berangkat</p>
      </div>

      {/* Success toast */}
      {orderSuccess && (
        <div className="mb-5 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-green-700 dark:text-green-300">{orderSuccess}</p>
          <button onClick={() => { setOrderSuccess(''); router.push('/orders') }} className="text-green-500 ml-4 text-xs underline shrink-0">
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
        <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none">
          <option value="">Semua negara</option>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none">
          <option value="newest">Terbaru</option>
          <option value="arrival_soon">Tiba paling cepat</option>
        </select>
        <div className="flex items-center ml-auto">
          <p className="text-xs text-gray-500 dark:text-gray-400">{trips.length} trip tersedia</p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada trip yang tersedia</p>
        </div>
      ) : (
        <div className="space-y-6">
          {trips.map(trip => {
            const dl = daysLeft(trip.arrival_date)
            return (
              <div key={trip.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                {/* Trip header */}
                {trip.image_url && (
                  <img src={trip.image_url} className="w-full h-36 object-cover" alt={trip.title} />
                )}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{trip.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-gray-500 dark:text-gray-400">📍 {trip.trip_country}</span>
                        <span className="text-gray-300 dark:text-gray-600">·</span>
                        <span className={`text-xs font-medium ${dl.urgent ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}`}>
                          ✈️ Tiba {dl.label}
                        </span>
                      </div>
                    </div>
                    {/* Jastiper */}
                    {trip.jastiper && (
                      <div className="flex items-center gap-2 shrink-0">
                        {trip.jastiper.avatar_url ? (
                          <img src={trip.jastiper.avatar_url} className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-300 uppercase">
                            {trip.jastiper.full_name?.[0] ?? '?'}
                          </div>
                        )}
                        <p className="text-xs text-gray-600 dark:text-gray-400">{trip.jastiper.full_name}</p>
                      </div>
                    )}
                  </div>
                  {trip.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">{trip.description}</p>
                  )}
                </div>

                {/* Products */}
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {trip.products.map(product => (
                    <div key={product.id} className="flex gap-3 p-4">
                      {product.image_url ? (
                        <img src={product.image_url} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.product_name}</p>
                        {product.product_url && (
                          <a href={product.product_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                            Lihat produk →
                          </a>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">Stok: {product.stock}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{formatRupiah(product.total_price_idr)}</p>
                        <p className="text-xs text-gray-400">+5% fee</p>
                        <button
                          onClick={() => { setSelectedProduct({ product, trip }); setOrderError('') }}
                          className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg px-3 py-1.5 text-xs font-medium hover:opacity-90 transition-all"
                        >
                          Order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}