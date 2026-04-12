'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Request = {
  id: string
  buyer_id: string
  product_name: string
  product_url: string
  quantity: number
  max_budget_idr: number
  deadline: string
  delivery_pref: 'courier' | 'meetup'
  shipping_address: string | null
  meetup_location: string | null
  meetup_time: string | null
  notes: string | null
  created_at: string
  users: {
    full_name: string
    avatar_url: string | null
  }
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysLeft(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now()
  const days = Math.ceil(diff / 1000 / 60 / 60 / 24)
  if (days < 0) return { label: 'Kadaluarsa', urgent: true }
  if (days === 0) return { label: 'Hari ini', urgent: true }
  if (days === 1) return { label: '1 hari lagi', urgent: true }
  return { label: `${days} hari lagi`, urgent: days <= 3 }
}

export default function BrowseRequestsPage() {
  const supabase = createClient()
  const router = useRouter()

  const [requests, setRequests] = useState<Request[]>([])
  const [allRequests, setAllRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Request | null>(null)
  const [fixedPrice, setFixedPrice] = useState('')
  const [takingLoading, setTakingLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userId, setUserId] = useState('')
  const [search, setSearch] = useState('')
  const [filterDelivery, setFilterDelivery] = useState<'all' | 'courier' | 'meetup'>('all')
  const [filterDeadline, setFilterDeadline] = useState<'all' | 'urgent' | 'week'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'budget_high' | 'deadline_soon'>('newest')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      // cek apakah user adalah jastiper aktif
      const { data: userData } = await supabase
        .from('users')
        .select('is_jastiper, active_role')
        .eq('id', user.id)
        .single()

      if (!userData?.is_jastiper || userData.active_role !== 'jastiper') {
        router.push('/dashboard')
        return
      }

      fetchRequests()
    }
    init()
  }, [])

  async function fetchRequests() {
    setLoading(true)
    const { data } = await supabase
      .from('requests')
      .select('id, buyer_id, product_name, product_url, quantity, max_budget_idr, deadline, delivery_pref, shipping_address, meetup_location, meetup_time, notes, created_at, users!requests_buyer_id_fkey(full_name, avatar_url)')
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    setAllRequests((data as any) ?? [])
    setRequests((data as any) ?? [])
    setLoading(false)
  }

  async function handleTakeRequest() {
    if (!fixedPrice) { setError('Harga fix wajib diisi'); return }

    const price = parseFloat(fixedPrice)
    if (isNaN(price) || price <= 0) { setError('Harga tidak valid'); return }
    if (price > selected!.max_budget_idr) {
      setError(`Harga fix tidak boleh melebihi max budget buyer (${formatRupiah(selected!.max_budget_idr)})`)
      return
    }

    setTakingLoading(true)
    setError('')

    const paymentExpiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    // update request
    const { error: reqError } = await supabase.from('requests').update({
      jastiper_id: userId,
      fixed_price_idr: price,
      status: 'matched',
      payment_expired_at: paymentExpiredAt,
    }).eq('id', selected!.id)

    if (reqError) { setError('Gagal mengambil request: ' + reqError.message); setTakingLoading(false); return }

    // buat order otomatis
    const orderPayload: any = {
      buyer_id: selected!.buyer_id,
      jastiper_id: userId,
      request_id: selected!.id,
      flow_type: 'flow_a',
      product_url: selected!.product_url,
      product_name: selected!.product_name,
      quantity: selected!.quantity,
      delivery_pref: selected!.delivery_pref,
      notes: selected!.notes,
      status: 'waiting_payment',
    }

    if (selected!.delivery_pref === 'courier') {
      orderPayload.shipping_address = selected!.shipping_address
    } else {
      orderPayload.meetup_location = selected!.meetup_location
      orderPayload.meetup_time = selected!.meetup_time
    }

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select('id')
      .single()

    if (orderError) { setError('Gagal membuat order: ' + orderError.message); setTakingLoading(false); return }

    // buat order_pricing
    const platformFee = Math.round(price * 0.05)
    await supabase.from('order_pricing').insert({
      order_id: orderData.id,
      product_price_idr: price,
      service_fee_idr: 0,
      shipping_fee_idr: 0,
      platform_fee_idr: platformFee,
      estimated_customs_idr: 0,
      total_idr: price + platformFee,
    })

    // buat escrow
    await supabase.from('escrow_transactions').insert({
      order_id: orderData.id,
      amount_idr: price + platformFee,
      status: 'held',
    })

    setSuccess(`Request berhasil diambil! Tagihan sebesar ${formatRupiah(price + platformFee)} sudah dikirim ke buyer.`)
    setSelected(null)
    setFixedPrice('')
    setTakingLoading(false)
    fetchRequests()
  }

  return (
    <div className="max-w-2xl">

      {/* Modal ambil request */}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Ambil Request</h2>
              <button onClick={() => { setSelected(null); setFixedPrice(''); setError('') }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="font-medium text-gray-900 dark:text-white text-sm mb-1">{selected.product_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Max budget buyer: <span className="font-semibold text-gray-700 dark:text-gray-200">{formatRupiah(selected.max_budget_idr)}</span></p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Set harga fix (IDR) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">Rp</span>
                  <input
                    type="number"
                    min={0}
                    max={selected.max_budget_idr}
                    placeholder={selected.max_budget_idr.toString()}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={fixedPrice}
                    onChange={e => setFixedPrice(e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Harga fix harus ≤ {formatRupiah(selected.max_budget_idr)}</p>
              </div>

              {fixedPrice && parseFloat(fixedPrice) > 0 && parseFloat(fixedPrice) <= selected.max_budget_idr && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Ringkasan tagihan ke buyer:</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start text-xs text-blue-700 dark:text-blue-300">
                      <div>
                        <p>Harga fix (all-in)</p>
                        <p className="text-blue-500 dark:text-blue-400 text-[11px] mt-0.5">
                          Sudah termasuk harga barang, service fee kamu & ongkir
                        </p>
                      </div>
                      <span className="font-medium shrink-0 ml-3">{formatRupiah(parseFloat(fixedPrice))}</span>
                    </div>
                    <div className="flex justify-between text-xs text-blue-700 dark:text-blue-300">
                      <span>Platform fee Jastipal (5%)</span>
                      <span>{formatRupiah(Math.round(parseFloat(fixedPrice) * 0.05))}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-blue-800 dark:text-blue-200 pt-1.5 border-t border-blue-200 dark:border-blue-700">
                      <span>Total dibayar buyer</span>
                      <span>{formatRupiah(parseFloat(fixedPrice) + Math.round(parseFloat(fixedPrice) * 0.05))}</span>
                    </div>
                  </div>
                </div>
              )}

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Setelah kamu ambil request ini, tagihan akan langsung muncul ke buyer. Buyer punya 24 jam untuk membayar — jika tidak, order otomatis dibatalkan.
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setSelected(null); setFixedPrice(''); setError('') }}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleTakeRequest}
                  disabled={takingLoading || !fixedPrice}
                  className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {takingLoading ? 'Memproses...' : 'Ambil Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Browse Request</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pilih request yang ingin kamu handle</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Cari nama produk, URL, atau catatan..."
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
        {/* Delivery filter */}
        <select
          value={filterDelivery}
          onChange={e => setFilterDelivery(e.target.value as any)}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none focus:border-gray-500"
        >
          <option value="all">Semua pengiriman</option>
          <option value="courier">Courier</option>
          <option value="meetup">Meetup</option>
        </select>

        {/* Deadline filter */}
        <select
          value={filterDeadline}
          onChange={e => setFilterDeadline(e.target.value as any)}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none focus:border-gray-500"
        >
          <option value="all">Semua deadline</option>
          <option value="urgent">Urgent (≤ 3 hari)</option>
          <option value="week">Minggu ini</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none focus:border-gray-500"
        >
          <option value="newest">Terbaru</option>
          <option value="budget_high">Budget tertinggi</option>
          <option value="deadline_soon">Deadline terdekat</option>
        </select>

        {/* Result count */}
        <div className="flex items-center ml-auto">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {requests.length} request{requests.length !== allRequests.length ? ` dari ${allRequests.length}` : ''}
          </p>
        </div>
      </div>

      {/* Success toast */}
      {success && (
        <div className="mb-6 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
          <button onClick={() => setSuccess('')} className="text-green-500 ml-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada request yang tersedia</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const dl = daysLeft(req.deadline)
            return (
              <div key={req.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                {/* Buyer info */}
                <div className="flex items-center gap-2 mb-4">
                  {req.users.avatar_url ? (
                    <img src={req.users.avatar_url} className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-300 uppercase">
                      {req.users.full_name?.[0] ?? '?'}
                    </div>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400">{req.users.full_name}</p>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <p className="text-xs text-gray-400">{formatDate(req.created_at)}</p>
                </div>

                {/* Produk */}
                <div className="mb-4">
                  <p className="font-semibold text-gray-900 dark:text-white mb-0.5">{req.product_name}</p>
                  <a href={req.product_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block">
                    {req.product_url}
                  </a>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Max Budget</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{formatRupiah(req.max_budget_idr)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Deadline</p>
                    <p className={`text-sm font-semibold ${dl.urgent ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                      {dl.label}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Pengiriman</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{req.delivery_pref}</p>
                  </div>
                </div>

                {/* Delivery detail */}
                {req.delivery_pref === 'courier' && req.shipping_address && (
                  <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {req.shipping_address}
                  </div>
                )}
                {req.delivery_pref === 'meetup' && req.meetup_location && (
                  <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {req.meetup_location}
                    {req.meetup_time && ` · ${new Date(req.meetup_time).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`}
                  </div>
                )}

                {req.notes && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-4">"{req.notes}"</p>
                )}

                {/* Jumlah + tombol */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{req.quantity} pcs</p>
                  <button
                    onClick={() => { setSelected(req); setFixedPrice(''); setError('') }}
                    className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-all"
                  >
                    Ambil Request
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