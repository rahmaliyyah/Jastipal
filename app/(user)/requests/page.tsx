'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Request = {
  id: string
  jastiper_id: string | null
  order_id: string | null
  product_name: string
  product_url: string
  quantity: number
  max_budget_idr: number
  fixed_price_idr: number | null
  deadline: string
  delivery_pref: 'courier' | 'meetup'
  status: 'open' | 'matched' | 'cancelled'
  payment_expired_at: string | null
  notes: string | null
  created_at: string
  jastiper: {
    full_name: string
    avatar_url: string | null
    whatsapp_number: string | null
  } | null
}

const statusConfig = {
  open: { label: 'Menunggu Jastiper', color: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300' },
  matched: { label: 'Tagihan Masuk', color: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' },
  paid: { label: 'Sudah Dibayar', color: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300' },
  selesai: { label: 'Selesai', color: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300' },
  cancelled: { label: 'Dibatalkan', color: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400' },
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatExpiry(d: string) {
  const diff = new Date(d).getTime() - Date.now()
  if (diff <= 0) return 'Kadaluarsa'
  const hours = Math.floor(diff / 1000 / 60 / 60)
  const minutes = Math.floor((diff / 1000 / 60) % 60)
  return `${hours}j ${minutes}m tersisa`
}

export default function MyRequestsPage() {
  const supabase = createClient()
  const router = useRouter()

  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [tab, setTab] = useState<'open' | 'matched' | 'paid' | 'selesai' | 'cancelled'>('open')

  useEffect(() => { fetchRequests() }, [tab])

  async function fetchRequests() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // tab selesai query request matched filter by order status delivered
    // tab cancelled query request cancelled + matched with cancelled order
    const queryStatus = (tab === 'selesai' || tab === 'paid') ? 'matched' : tab === 'cancelled' ? 'in:matched,cancelled' : tab

    let query = supabase
      .from('requests')
      .select('id, jastiper_id, product_name, product_url, quantity, max_budget_idr, fixed_price_idr, deadline, delivery_pref, status, payment_expired_at, notes, created_at, jastiper:jastiper_id(full_name, avatar_url)')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })

    if (tab === 'selesai' || tab === 'paid') {
      query = query.eq('status', 'matched')
    } else if (tab === 'cancelled') {
      query = query.in('status', ['matched', 'cancelled'])
    } else {
      query = query.eq('status', tab)
    }

    const { data } = await query

    if (!data || data.length === 0) { setRequests([]); setLoading(false); return }

    // ambil whatsapp_number terpisah
    const jastiperIds = [...new Set(data.filter((r: any) => r.jastiper_id).map((r: any) => r.jastiper_id))]
    let waMap: Record<string, string | null> = {}

    if (jastiperIds.length > 0) {
      const { data: jpData } = await supabase
        .from('jastiper_profiles')
        .select('user_id, whatsapp_number')
        .in('user_id', jastiperIds)
      ;(jpData ?? []).forEach((jp: any) => { waMap[jp.user_id] = jp.whatsapp_number })
    }

    // ambil order_id dan status order secara terpisah
    const requestIds = data.map((r: any) => r.id)
    let orderMap: Record<string, { id: string; status: string }> = {}

    if (requestIds.length > 0) {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, request_id, status')
        .in('request_id', requestIds)
      ;(ordersData ?? []).forEach((o: any) => { orderMap[o.request_id] = { id: o.id, status: o.status } })
    }

    const mapped = data
      .filter((r: any) => {
        const orderStatus = orderMap[r.id]?.status
        if (tab === 'matched') {
          // hanya tampilkan yang ordernya waiting_payment
          if (orderStatus !== 'waiting_payment') return false
        }
        if (tab === 'paid') {
          // ordernya processing atau shipped
          return orderStatus === 'processing' || orderStatus === 'shipped'
        }
        if (tab === 'selesai') {
          return orderStatus === 'delivered'
        }
        if (tab === 'cancelled') {
          return orderStatus === 'cancelled'
        }
        return true
      })
      .map((r: any) => ({
        ...r,
        order_id: orderMap[r.id]?.id ?? null,
        jastiper: r.jastiper ? {
          full_name: r.jastiper.full_name,
          avatar_url: r.jastiper.avatar_url,
          whatsapp_number: waMap[r.jastiper_id] ?? null,
        } : null,
      }))

    setRequests(mapped)
    setLoading(false)
  }

  async function handleCancel(id: string) {
    setCancellingId(id)
    await supabase.from('requests').update({ status: 'cancelled' }).eq('id', id)
    setCancellingId(null)
    fetchRequests()
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Request Saya</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pantau status request barang kamu</p>
        </div>
        <button
          onClick={() => router.push('/requests/new')}
          className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Buat Request
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit mb-6">
        {(['open', 'matched', 'paid', 'selesai', 'cancelled'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {t === 'open' ? 'Menunggu' : t === 'matched' ? 'Tagihan' : t === 'paid' ? 'Diproses' : t === 'selesai' ? 'Selesai' : 'Batal'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1" ry="1"/>
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {tab === 'open' ? 'Belum ada request yang aktif' : tab === 'matched' ? 'Belum ada tagihan masuk' : tab === 'paid' ? 'Belum ada request yang diproses' : tab === 'selesai' ? 'Belum ada request yang selesai' : 'Tidak ada request yang dibatalkan'}
          </p>
          {tab === 'open' && (
            <button
              onClick={() => router.push('/requests/new')}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-all"
            >
              Buat Request Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
              {/* Header card */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{req.product_name}</p>
                  <a
                    href={req.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline truncate block"
                  >
                    {req.product_url}
                  </a>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusConfig[tab === 'selesai' ? 'selesai' : tab === 'paid' ? 'paid' : tab === 'cancelled' && req.status === 'matched' ? 'cancelled' : req.status].color}`}>
                  {statusConfig[tab === 'selesai' ? 'selesai' : tab === 'paid' ? 'paid' : tab === 'cancelled' && req.status === 'matched' ? 'cancelled' : req.status].label}
                </span>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Max Budget</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatRupiah(req.max_budget_idr)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Deadline</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(req.deadline)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Jumlah</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{req.quantity} pcs</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Pengiriman</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{req.delivery_pref}</p>
                </div>
              </div>

              {/* Info jastiper + harga — tampil di semua tab matched */}
              {req.status === 'matched' && req.fixed_price_idr && (
                <div className={`border rounded-lg p-4 mb-4 ${
                  tab === 'matched'
                    ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
                    : tab === 'paid'
                    ? 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800'
                    : 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                }`}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-sm font-semibold ${
                      tab === 'matched' ? 'text-blue-800 dark:text-blue-200'
                      : tab === 'paid' ? 'text-purple-800 dark:text-purple-200'
                      : 'text-green-800 dark:text-green-200'
                    }`}>
                      {tab === 'matched' ? 'Tagihan dari Jastiper'
                       : tab === 'paid' ? 'Sedang Diproses Jastiper'
                       : 'Order Selesai'}
                    </p>
                    {tab === 'matched' && req.payment_expired_at && (
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        ⏱ {formatExpiry(req.payment_expired_at)}
                      </span>
                    )}
                  </div>

                  {/* Info jastiper */}
                  {req.jastiper && (
                    <div className={`flex items-center gap-3 mb-3 pb-3 border-b ${
                      tab === 'matched' ? 'border-blue-200 dark:border-blue-800'
                      : tab === 'paid' ? 'border-purple-200 dark:border-purple-800'
                      : 'border-green-200 dark:border-green-800'
                    }`}>
                      {req.jastiper.avatar_url ? (
                        <img src={req.jastiper.avatar_url} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold uppercase ${
                          tab === 'matched' ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                          : tab === 'paid' ? 'bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300'
                          : 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300'
                        }`}>
                          {req.jastiper.full_name?.[0] ?? '?'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium ${
                          tab === 'matched' ? 'text-blue-800 dark:text-blue-200'
                          : tab === 'paid' ? 'text-purple-800 dark:text-purple-200'
                          : 'text-green-800 dark:text-green-200'
                        }`}>{req.jastiper.full_name}</p>
                        <p className={`text-xs ${
                          tab === 'matched' ? 'text-blue-600 dark:text-blue-400'
                          : tab === 'paid' ? 'text-purple-600 dark:text-purple-400'
                          : 'text-green-600 dark:text-green-400'
                        }`}>
                          {tab === 'paid' ? 'Jastiper sedang memproses pesananmu' : 'Jastiper yang mengambil request ini'}
                        </p>
                      </div>
                      {req.jastiper.whatsapp_number && (
                        <a
                          href={`https://wa.me/${req.jastiper.whatsapp_number.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-all shrink-0"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          WhatsApp
                        </a>
                      )}
                    </div>
                  )}

                  {/* Rincian harga */}
                  <div className="space-y-1.5 mb-3">
                    <div className={`flex justify-between items-start text-xs ${
                      tab === 'matched' ? 'text-blue-700 dark:text-blue-300'
                      : tab === 'paid' ? 'text-purple-700 dark:text-purple-300'
                      : 'text-green-700 dark:text-green-300'
                    }`}>
                      <div>
                        <p>Harga fix (all-in)</p>
                        <p className="text-[11px] mt-0.5 opacity-70">Sudah termasuk harga barang, service fee jastiper & ongkir</p>
                      </div>
                      <span className="font-medium shrink-0 ml-3">{formatRupiah(req.fixed_price_idr)}</span>
                    </div>
                    <div className={`flex justify-between text-xs ${
                      tab === 'matched' ? 'text-blue-700 dark:text-blue-300'
                      : tab === 'paid' ? 'text-purple-700 dark:text-purple-300'
                      : 'text-green-700 dark:text-green-300'
                    }`}>
                      <span>Platform fee Jastipal (5%)</span>
                      <span>{formatRupiah(Math.round(req.fixed_price_idr * 0.05))}</span>
                    </div>
                    <div className={`flex justify-between text-sm font-bold pt-1.5 border-t ${
                      tab === 'matched' ? 'text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700'
                      : tab === 'paid' ? 'text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700'
                      : 'text-green-800 dark:text-green-200 border-green-200 dark:border-green-700'
                    }`}>
                      <span>Total {tab === 'selesai' ? 'dibayar' : 'tagihan'}</span>
                      <span>{formatRupiah(req.fixed_price_idr + Math.round(req.fixed_price_idr * 0.05))}</span>
                    </div>
                  </div>

                  {/* Tombol bayar hanya di tab matched */}
                  {tab === 'matched' && (
                    <button
                      onClick={() => req.order_id ? router.push(`/orders/${req.order_id}/pay`) : router.push('/orders')}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium transition-all"
                    >
                      Bayar Sekarang
                    </button>
                  )}
                  {tab === 'matched' && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 text-center mt-2">
                      Tidak membayar = order otomatis dibatalkan setelah waktu habis
                    </p>
                  )}
                  {tab === 'paid' && (
                    <p className="text-xs text-purple-600 dark:text-purple-400 text-center">
                      Jastiper akan mengupdate status saat barang siap dikirim
                    </p>
                  )}
                  {tab === 'selesai' && (
                    <p className="text-xs text-green-600 dark:text-green-400 text-center">
                      Transaksi selesai — terima kasih telah menggunakan Jastipal!
                    </p>
                  )}
                </div>
              )}

              {req.notes && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">"{req.notes}"</p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400">{formatDate(req.created_at)}</p>
                {req.status === 'open' && (
                  <button
                    onClick={() => handleCancel(req.id)}
                    disabled={cancellingId === req.id}
                    className="text-xs text-red-500 hover:text-red-600 disabled:opacity-50 transition-all"
                  >
                    {cancellingId === req.id ? 'Membatalkan...' : 'Batalkan Request'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}