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
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Request | null>(null)
  const [fixedPrice, setFixedPrice] = useState('')
  const [takeLoading, setTakeLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { fetchRequests() }, [])

  async function fetchRequests() {
    setLoading(true)
    const { data } = await supabase
      .from('requests')
      .select('id, buyer_id, product_name, product_url, quantity, max_budget_idr, deadline, delivery_pref, shipping_address, meetup_location, meetup_time, notes, created_at, users!requests_buyer_id_fkey(full_name, avatar_url)')
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    setRequests((data as any) ?? [])
    setLoading(false)
  }

  async function handleTakeRequest() {
    if (!selected) return
    if (!fixedPrice || isNaN(parseFloat(fixedPrice))) {
      setError('Masukkan harga fix yang valid')
      return
    }
    const price = parseFloat(fixedPrice)
    if (price > selected.max_budget_idr) {
      setError(`Harga fix tidak boleh melebihi max budget buyer (${formatRupiah(selected.max_budget_idr)})`)
      return
    }
    if (price <= 0) {
      setError('Harga fix harus lebih dari 0')
      return
    }

    setTakeLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // set payment_expired_at = 24 jam dari sekarang
    const paymentExpiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    // update request → matched + set jastiper + fixed price
    const { error: updateError } = await supabase
      .from('requests')
      .update({
        jastiper_id: user.id,
        fixed_price_idr: price,
        status: 'matched',
        payment_expired_at: paymentExpiredAt,
      })
      .eq('id', selected.id)
      .eq('status', 'open') // pastikan belum diambil orang lain

    if (updateError) {
      setError('Gagal mengambil request, mungkin sudah diambil jastiper lain')
      setTakeLoading(false)
      return
    }

    // buat order otomatis
    const { error: orderError } = await supabase.from('orders').insert({
      buyer_id: selected.buyer_id,
      jastiper_id: user.id,
      request_id: selected.id,
      flow_type: 'flow_a',
      product_url: selected.product_url,
      product_name: selected.product_name,
      quantity: selected.quantity,
      delivery_pref: selected.delivery_pref,
      shipping_address: selected.shipping_address,
      meetup_location: selected.meetup_location,
      meetup_time: selected.meetup_time,
      notes: selected.notes,
      status: 'waiting_payment',
    })

    setTakeLoading(false)

    if (orderError) {
      setError('Request diambil tapi gagal buat order: ' + orderError.message)
      return
    }

    setSelected(null)
    setFixedPrice('')
    setSuccess('Request berhasil diambil! Tagihan sudah dikirim ke buyer.')
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
              <button
                onClick={() => { setSelected(null); setFixedPrice(''); setError('') }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Info produk */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="font-medium text-gray-900 dark:text-white mb-1">{selected.product_name}</p>
                <a href={selected.product_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline break-all">
                  {selected.product_url}
                </a>
                <div className="flex gap-4 mt-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Max Budget</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatRupiah(selected.max_budget_idr)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Deadline</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(selected.deadline)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Jumlah</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selected.quantity} pcs</p>
                  </div>
                </div>
              </div>

              {/* Input harga fix */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Set harga fix kamu (IDR) <span className="text-red-400">*</span>
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
                <p className="text-xs text-gray-400 mt-1">
                  Harga harus ≤ {formatRupiah(selected.max_budget_idr)}. Setelah kamu set, tagihan langsung muncul ke buyer.
                </p>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              {/* Info warning */}
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  Setelah mengambil request ini, buyer punya <strong>24 jam</strong> untuk membayar. Jika tidak dibayar, order otomatis dibatalkan.
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setSelected(null); setFixedPrice(''); setError('') }}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleTakeRequest}
                  disabled={takeLoading || !fixedPrice}
                  className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {takeLoading ? 'Memproses...' : 'Ambil Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Browse Request</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Pilih request buyer yang ingin kamu bantu
        </p>
      </div>

      {/* Success toast */}
      {success && (
        <div className="mb-6 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
          <button onClick={() => setSuccess('')} className="text-green-500 ml-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
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
            const deadline = daysLeft(req.deadline)
            return (
              <div key={req.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                {/* Buyer info */}
                <div className="flex items-center gap-2 mb-4">
                  {req.users?.avatar_url ? (
                    <img src={req.users.avatar_url} className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-300 uppercase">
                      {req.users?.full_name?.[0] ?? '?'}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">{req.users?.full_name}</p>
                  <span className="ml-auto text-xs text-gray-400">{formatDate(req.created_at)}</span>
                </div>

                {/* Produk */}
                <div className="mb-4">
                  <p className="font-medium text-gray-900 dark:text-white mb-0.5">{req.product_name}</p>
                  <a href={req.product_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block">
                    {req.product_url}
                  </a>
                </div>

                {/* Info */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Max Budget</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatRupiah(req.max_budget_idr)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Jumlah</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{req.quantity} pcs</p>
                  </div>
                  <div className={`rounded-lg p-2.5 text-center ${deadline.urgent ? 'bg-red-50 dark:bg-red-950' : 'bg-gray-50 dark:bg-gray-800'}`}>
                    <p className={`text-xs mb-0.5 ${deadline.urgent ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>Deadline</p>
                    <p className={`text-sm font-semibold ${deadline.urgent ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{deadline.label}</p>
                  </div>
                </div>

                {/* Delivery & notes */}
                <div className="flex items-center gap-3 mb-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    {req.delivery_pref === 'courier' ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                    )}
                    <span className="capitalize">{req.delivery_pref}</span>
                  </div>
                  {req.delivery_pref === 'meetup' && req.meetup_location && (
                    <span className="truncate">{req.meetup_location}</span>
                  )}
                </div>

                {req.notes && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic mb-4">"{req.notes}"</p>
                )}

                {/* Tombol ambil */}
                <button
                  onClick={() => { setSelected(req); setFixedPrice(''); setError('') }}
                  className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg py-2.5 text-sm font-medium hover:opacity-90 transition-all"
                >
                  Ambil Request Ini
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}