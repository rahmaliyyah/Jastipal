'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Order = {
  id: string
  flow_type: 'flow_a' | 'flow_b'
  product_name: string
  product_url: string
  quantity: number
  delivery_pref: 'courier' | 'meetup'
  shipping_address: string | null
  meetup_location: string | null
  meetup_time: string | null
  status: 'waiting_payment' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  tracking_number: string | null
  notes: string | null
  created_at: string
  buyer_id: string
  jastiper_id: string
  counterpart: {
    full_name: string
    avatar_url: string | null
    whatsapp_number: string | null
  } | null
  pricing: {
    product_price_idr: number
    platform_fee_idr: number
    total_idr: number
  } | null
}

const statusConfig: Record<string, { label: string; color: string; step: number }> = {
  waiting_payment: { label: 'Menunggu Pembayaran', color: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300', step: 1 },
  processing:      { label: 'Diproses Jastiper',   color: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',     step: 2 },
  shipped:         { label: 'Dikirim',              color: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300', step: 3 },
  delivered:       { label: 'Selesai',              color: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300',  step: 4 },
  cancelled:       { label: 'Dibatalkan',           color: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',     step: 0 },
}

const steps = ['Menunggu Bayar', 'Diproses', 'Dikirim', 'Selesai']

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function OrdersPage() {
  const supabase = createClient()
  const router = useRouter()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeRole, setActiveRole] = useState<'buyer' | 'jastiper'>('buyer')
  const [userId, setUserId] = useState('')
  const [tab, setTab] = useState<'active' | 'done'>('active')
  const [selected, setSelected] = useState<Order | null>(null)
  const [trackingInput, setTrackingInput] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: userData } = await supabase
        .from('users')
        .select('active_role')
        .eq('id', user.id)
        .single()

      setActiveRole(userData?.active_role ?? 'buyer')
    }
    init()
  }, [])

  useEffect(() => {
    if (userId) fetchOrders()
  }, [userId, activeRole, tab])

  async function fetchOrders() {
    setLoading(true)

    const activeStatuses = ['waiting_payment', 'processing', 'shipped']
    const doneStatuses = ['delivered', 'cancelled']
    const statuses = tab === 'active' ? activeStatuses : doneStatuses

    const col = activeRole === 'buyer' ? 'buyer_id' : 'jastiper_id'
    const counterpartCol = activeRole === 'buyer' ? 'jastiper_id' : 'buyer_id'

    const { data } = await supabase
      .from('orders')
      .select('id, flow_type, product_name, product_url, quantity, delivery_pref, shipping_address, meetup_location, meetup_time, status, tracking_number, notes, created_at, buyer_id, jastiper_id, order_pricing(product_price_idr, platform_fee_idr, total_idr)')
      .eq(col, userId)
      .in('status', statuses)
      .order('created_at', { ascending: false })

    if (!data) { setOrders([]); setLoading(false); return }

    // ambil info counterpart
    const counterpartIds = [...new Set(data.map((o: any) => o[counterpartCol]).filter(Boolean))]
    let counterpartMap: Record<string, any> = {}

    if (counterpartIds.length > 0) {
      const { data: usersData } = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .in('id', counterpartIds)

      const { data: jpData } = await supabase
        .from('jastiper_profiles')
        .select('user_id, whatsapp_number')
        .in('user_id', counterpartIds)

      const waMap: Record<string, string> = {}
      ;(jpData ?? []).forEach((jp: any) => { waMap[jp.user_id] = jp.whatsapp_number })
      ;(usersData ?? []).forEach((u: any) => {
        counterpartMap[u.id] = { full_name: u.full_name, avatar_url: u.avatar_url, whatsapp_number: waMap[u.id] ?? null }
      })
    }

    const mapped = data.map((o: any) => ({
      ...o,
      counterpart: counterpartMap[o[counterpartCol]] ?? null,
      pricing: o.order_pricing?.[0] ?? null,
    }))

    setOrders(mapped)
    setLoading(false)
  }

  async function handleShipped(order: Order) {
    if (!trackingInput.trim()) return
    setActionLoading(true)

    await supabase.from('orders').update({
      status: 'shipped',
      tracking_number: trackingInput,
    }).eq('id', order.id)

    setSuccess('Status order berhasil diupdate ke Dikirim')
    setSelected(null)
    setTrackingInput('')
    setActionLoading(false)
    fetchOrders()
  }

  async function handleDelivered(order: Order) {
    setActionLoading(true)

    await supabase.from('orders').update({ status: 'delivered' }).eq('id', order.id)

    // release escrow
    await supabase.from('escrow_transactions').update({
      status: 'released',
      released_at: new Date().toISOString(),
    }).eq('order_id', order.id)

    setSuccess('Order selesai! Dana sudah dicairkan ke jastiper.')
    setSelected(null)
    setActionLoading(false)
    fetchOrders()
  }

  async function handleCancel(order: Order) {
    setActionLoading(true)

    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id)

    await supabase.from('escrow_transactions').update({
      status: 'refunded',
      released_at: new Date().toISOString(),
    }).eq('order_id', order.id)

    setSuccess('Order dibatalkan, dana akan dikembalikan.')
    setSelected(null)
    setActionLoading(false)
    fetchOrders()
  }

  function renderActions(order: Order) {
    if (order.status === 'cancelled' || order.status === 'delivered') return null

    // buyer actions
    if (activeRole === 'buyer') {
      if (order.status === 'shipped') {
        return (
          <button
            onClick={() => { setSelected(order); }}
            className="w-full bg-green-500 hover:bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium transition-all"
          >
            Konfirmasi Terima Barang
          </button>
        )
      }
      if (order.status === 'waiting_payment') {
        return (
          <button
            onClick={() => router.push(`/orders/${order.id}/pay`)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium transition-all"
          >
            Bayar Sekarang
          </button>
        )
      }
    }

    // jastiper actions
    if (activeRole === 'jastiper') {
      if (order.status === 'processing') {
        return (
          <button
            onClick={() => setSelected(order)}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-lg py-2.5 text-sm font-medium transition-all"
          >
            Input Nomor Resi
          </button>
        )
      }
    }

    return null
  }

  return (
    <div className="max-w-2xl">

      {/* Modal konfirmasi */}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md shadow-2xl p-6">

            {/* Buyer: konfirmasi terima barang */}
            {activeRole === 'buyer' && selected.status === 'shipped' && (
              <>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Konfirmasi Terima Barang</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Pastikan barang sudah kamu terima dengan kondisi baik sebelum konfirmasi. Dana akan langsung dicairkan ke jastiper setelah konfirmasi.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setSelected(null)} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                    Batal
                  </button>
                  <button
                    onClick={() => handleDelivered(selected)}
                    disabled={actionLoading}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50 transition-all"
                  >
                    {actionLoading ? 'Memproses...' : 'Ya, Sudah Terima'}
                  </button>
                </div>
              </>
            )}

            {/* Jastiper: input nomor resi */}
            {activeRole === 'jastiper' && selected.status === 'processing' && (
              <>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Input Nomor Resi</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Masukkan nomor resi pengiriman untuk order ini.
                </p>
                <input
                  placeholder="Contoh: JNE123456789"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-4"
                  value={trackingInput}
                  onChange={e => setTrackingInput(e.target.value)}
                />
                <div className="flex gap-2">
                  <button onClick={() => { setSelected(null); setTrackingInput('') }} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                    Batal
                  </button>
                  <button
                    onClick={() => handleShipped(selected)}
                    disabled={actionLoading || !trackingInput.trim()}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50 transition-all"
                  >
                    {actionLoading ? 'Menyimpan...' : 'Simpan & Kirim'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {activeRole === 'buyer' ? 'Pesanan Saya' : 'Order Masuk'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {activeRole === 'buyer' ? 'Pantau status pesanan kamu' : 'Kelola order yang sedang kamu handle'}
          </p>
        </div>
      </div>

      {/* Success toast */}
      {success && (
        <div className="mb-5 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
          <button onClick={() => setSuccess('')} className="text-green-500 ml-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit mb-6">
        {(['active', 'done'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {t === 'active' ? 'Aktif' : 'Selesai / Batal'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {tab === 'active' ? 'Tidak ada order aktif' : 'Belum ada order yang selesai atau dibatalkan'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const cfg = statusConfig[order.status]
            const step = cfg?.step ?? 0
            return (
              <div key={order.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">

                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{order.product_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)} · {order.flow_type === 'flow_a' ? 'Request' : 'Listing'}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${cfg?.color}`}>
                    {cfg?.label}
                  </span>
                </div>

                {/* Progress steps — hanya untuk order aktif */}
                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <div className="flex items-center gap-0 mb-4">
                    {steps.map((s, i) => (
                      <div key={s} className="flex items-center flex-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          i + 1 <= step
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                        }`}>
                          {i + 1 <= step ? '✓' : i + 1}
                        </div>
                        {i < steps.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 ${i + 1 < step ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Counterpart info */}
                {order.counterpart && (
                  <div className="flex items-center gap-2 mb-4">
                    {order.counterpart.avatar_url ? (
                      <img src={order.counterpart.avatar_url} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-300 uppercase">
                        {order.counterpart.full_name?.[0] ?? '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activeRole === 'buyer' ? 'Jastiper' : 'Buyer'}: <span className="font-medium text-gray-900 dark:text-white">{order.counterpart.full_name}</span>
                      </p>
                    </div>
                    {order.counterpart.whatsapp_number && (
                      <a
                        href={`https://wa.me/${order.counterpart.whatsapp_number.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white rounded-lg px-2.5 py-1 text-xs font-medium transition-all"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WA
                      </a>
                    )}
                  </div>
                )}

                {/* Pricing */}
                {order.pricing && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4 space-y-1">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Harga fix (all-in)</span>
                      <span>{formatRupiah(order.pricing.product_price_idr)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Platform fee (5%)</span>
                      <span>{formatRupiah(order.pricing.platform_fee_idr)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-gray-900 dark:text-white pt-1 border-t border-gray-200 dark:border-gray-700">
                      <span>Total</span>
                      <span>{formatRupiah(order.pricing.total_idr)}</span>
                    </div>
                  </div>
                )}

                {/* Delivery info */}
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 space-y-1">
                  <p className="capitalize">📦 {order.delivery_pref === 'courier' ? `Courier → ${order.shipping_address ?? '-'}` : `Meetup → ${order.meetup_location ?? '-'}`}</p>
                  {order.tracking_number && (
                    <p>🚚 Resi: <span className="font-medium text-gray-700 dark:text-gray-300">{order.tracking_number}</span></p>
                  )}
                </div>

                {/* Actions */}
                {renderActions(order)}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}