'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Order = {
  id: string
  flow_type: 'flow_a' | 'flow_b'
  listing_id: string | null
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
  proof: {
    receipt_url: string
    store_photo_url: string | null
  } | null
  payment_proof_url: string | null
  dispute: {
    reason: string
    resolution: string | null
    status: string
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
  const [tab, setTab] = useState<'waiting' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('waiting')
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

    const tabStatusMap: Record<string, string[]> = {
      waiting:    activeRole === 'buyer' ? ['waiting_payment'] : ['waiting_payment', 'processing'],
      processing: activeRole === 'buyer' ? ['processing', 'shipped'] : ['shipped'],
      shipped:    activeRole === 'jastiper' ? ['shipped'] : ['processing', 'shipped'],
      delivered:  ['delivered'],
      cancelled:  ['cancelled'],
    }

    // buyer tab mapping
    const buyerTabMap: Record<string, string[]> = {
      waiting:    ['waiting_payment'],
      processing: ['processing', 'shipped'],
      delivered:  ['delivered'],
      cancelled:  ['cancelled'],
    }

    // jastiper tab mapping
    const jastiperTabMap: Record<string, string[]> = {
      waiting:    ['waiting_payment', 'processing'],
      processing: ['shipped'],
      delivered:  ['delivered'],
      cancelled:  ['cancelled'],
    }

    const statuses = activeRole === 'buyer'
      ? (buyerTabMap[tab] ?? ['waiting_payment'])
      : (jastiperTabMap[tab] ?? ['waiting_payment', 'processing'])

    const col = activeRole === 'buyer' ? 'buyer_id' : 'jastiper_id'
    const counterpartCol = activeRole === 'buyer' ? 'jastiper_id' : 'buyer_id'

    const { data } = await supabase
      .from('orders')
      .select('id, flow_type, listing_id, product_name, product_url, quantity, delivery_pref, shipping_address, meetup_location, meetup_time, status, tracking_number, notes, created_at, buyer_id, jastiper_id, order_pricing(product_price_idr, platform_fee_idr, total_idr)')
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

    // ambil proof dan escrow terpisah
    const orderIds = data.map((o: any) => o.id)
    let proofMap: Record<string, any> = {}
    let escrowMap: Record<string, string | null> = {}
    let disputeMap: Record<string, any> = {}

    if (orderIds.length > 0) {
      const { data: escrowData } = await supabase
        .from('escrow_transactions')
        .select('order_id, payment_proof_url')
        .in('order_id', orderIds)
      ;(escrowData ?? []).forEach((e: any) => { escrowMap[e.order_id] = e.payment_proof_url })
    }

    if (orderIds.length > 0) {
      const { data: proofData } = await supabase
        .from('proof_of_purchase')
        .select('order_id, receipt_url, store_photo_url')
        .in('order_id', orderIds)
      ;(proofData ?? []).forEach((p: any) => { proofMap[p.order_id] = p })
    }

    if (orderIds.length > 0) {
      const { data: disputeData } = await supabase
        .from('disputes')
        .select('order_id, reason, resolution, status')
        .in('order_id', orderIds)
      ;(disputeData ?? []).forEach((d: any) => { disputeMap[d.order_id] = d })
    }

    const mapped = data.map((o: any) => ({
      ...o,
      counterpart: counterpartMap[o[counterpartCol]] ?? null,
      pricing: o.order_pricing?.[0] ?? null,
      proof: proofMap[o.id] ?? null,
      payment_proof_url: escrowMap[o.id] ?? null,
      dispute: disputeMap[o.id] ?? null,
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

    setSuccess('Nomor resi berhasil disimpan, status order diupdate ke Dikirim')
    setSelected(null)
    setTrackingInput('')
    setActionLoading(false)
    fetchOrders()
  }

  async function handleMeetupDone(order: Order) {
    setActionLoading(true)

    await supabase.from('orders').update({ status: 'delivered' }).eq('id', order.id)

    await supabase.from('escrow_transactions').update({
      status: 'released',
      released_at: new Date().toISOString(),
    }).eq('order_id', order.id)

    setSuccess('Meetup selesai! Dana sudah dicairkan ke kamu.')
    setSelected(null)
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

    // batalkan order
    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id)

    // kembalikan stok jika flow_b (listing)
    if (order.flow_type === 'flow_b' && order.listing_id) {
      const { data: listing } = await supabase
        .from('listings')
        .select('stock')
        .eq('id', order.listing_id)
        .single()
      if (listing) {
        await supabase.from('listings').update({ stock: listing.stock + order.quantity }).eq('id', order.listing_id)
      }
    }

    // update escrow jadi refunded
    await supabase.from('escrow_transactions').update({ status: 'refunded' }).eq('order_id', order.id)

    setSuccess('Pesanan berhasil dibatalkan')
    setActionLoading(false)
    fetchOrders()
  }

  function renderActions(order: Order) {
    if (order.status === 'cancelled' || order.status === 'delivered') return null

    // buyer actions
    if (activeRole === 'buyer') {
      if (order.status === 'shipped') {
        return (
          <div className="space-y-2">
            <button
              onClick={() => { setSelected(order); }}
              className="w-full bg-green-500 hover:bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium transition-all"
            >
              Konfirmasi Terima Barang
            </button>
            {!order.dispute && (
              <button
                onClick={() => router.push(`/orders/${order.id}/dispute`)}
                className="w-full border border-red-300 dark:border-red-700 text-red-500 rounded-lg py-2 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950 transition-all"
              >
                Ada Masalah? Buka Dispute
              </button>
            )}
          </div>
        )
      }
      if (order.status === 'processing') {
        return !order.dispute ? (
          <button
            onClick={() => router.push(`/orders/${order.id}/dispute`)}
            className="w-full border border-red-300 dark:border-red-700 text-red-500 rounded-lg py-2 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950 transition-all"
          >
            Ada Masalah? Buka Dispute
          </button>
        ) : null
      }

      if (order.status === 'waiting_payment') {
        if (order.payment_proof_url) {
          return (
            <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg px-4 py-3 text-center">
              <p className="text-sm font-medium text-orange-700 dark:text-orange-300">⏳ Bukti transfer sedang direview admin</p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Biasanya selesai dalam 1x24 jam</p>
            </div>
          )
        }
        return (
          <div className="space-y-2">
            <button
              onClick={() => router.push(`/orders/${order.id}/pay`)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium transition-all"
            >
              Bayar Sekarang
            </button>
            <button
              onClick={() => handleCancel(order)}
              disabled={actionLoading}
              className="w-full border border-red-300 dark:border-red-700 text-red-500 rounded-lg py-2 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50 transition-all"
            >
              Batalkan Pesanan
            </button>
          </div>
        )
      }
    }

    // jastiper actions
    if (activeRole === 'jastiper') {
      if (order.status === 'processing') {
        return (
          <button
            onClick={() => router.push(`/orders/${order.id}/proof`)}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-lg py-2.5 text-sm font-medium transition-all"
          >
            {order.delivery_pref === 'courier' ? 'Upload Struk & Input Nomor Resi' : 'Upload Struk & Konfirmasi Meetup'}
          </button>
        )
      }
      if (order.status === 'shipped') {
        return !order.dispute ? (
          <button
            onClick={() => router.push(`/orders/${order.id}/dispute`)}
            className="w-full border border-red-300 dark:border-red-700 text-red-500 rounded-lg py-2 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950 transition-all"
          >
            Buyer Tidak Konfirmasi? Buka Dispute
          </button>
        ) : null
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
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit mb-6 flex-wrap">
        {(activeRole === 'buyer'
          ? ['waiting', 'processing', 'delivered', 'cancelled'] as const
          : ['waiting', 'processing', 'delivered', 'cancelled'] as const
        ).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {activeRole === 'buyer'
              ? t === 'waiting' ? 'Menunggu Bayar'
              : t === 'processing' ? 'Diproses'
              : t === 'delivered' ? 'Selesai'
              : 'Dibatalkan'
              : t === 'waiting' ? 'Perlu Diproses'
              : t === 'processing' ? 'Dikirim'
              : t === 'delivered' ? 'Selesai'
              : 'Dibatalkan'
            }
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
            {tab === 'waiting' ? (activeRole === 'buyer' ? 'Tidak ada order menunggu pembayaran' : 'Tidak ada order yang perlu diproses')
            : tab === 'processing' ? (activeRole === 'buyer' ? 'Tidak ada order yang sedang diproses' : 'Tidak ada order yang sedang dikirim')
            : tab === 'delivered' ? 'Belum ada order yang selesai'
            : 'Tidak ada order yang dibatalkan'}
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
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                    order.status === 'waiting_payment' && order.payment_proof_url
                      ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
                      : cfg?.color
                  }`}>
                    {order.status === 'waiting_payment' && order.payment_proof_url
                      ? 'Bukti Direview Admin'
                      : cfg?.label}
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
                  {order.delivery_pref === 'courier' ? (
                    <p>📦 Courier → {order.shipping_address ?? '-'}</p>
                  ) : (
                    <>
                      <p>🤝 Meetup → {order.meetup_location ?? '-'}</p>
                      {order.meetup_time && (
                        <p>🕐 Waktu meetup: <span className="font-medium text-gray-700 dark:text-gray-300">
                          {new Date(order.meetup_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span></p>
                      )}
                    </>
                  )}
                  {order.tracking_number && (
                    <p>🚚 Resi: <span className="font-medium text-gray-700 dark:text-gray-300">{order.tracking_number}</span></p>
                  )}
                </div>

                {/* Bukti pembelian — tampil ke buyer jika sudah ada */}
                {activeRole === 'buyer' && order.proof && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Bukti Pembelian dari Jastiper</p>
                    <div className="flex gap-2">
                      <a
                        href={order.proof.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg py-2 text-blue-500 hover:text-blue-600 font-medium transition-all"
                      >
                        🧾 Lihat Struk
                      </a>
                      {order.proof.store_photo_url && (
                        <a
                          href={order.proof.store_photo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg py-2 text-blue-500 hover:text-blue-600 font-medium transition-all"
                        >
                          📸 Foto Toko
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Info dispute open - menunggu penanganan */}
                {order.dispute && order.dispute.status === 'open' && (
                  <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                    <p className="text-xs font-medium text-yellow-700 dark:text-yellow-300">⏳ Dispute sedang menunggu penanganan admin</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">{order.dispute.reason}</p>
                  </div>
                )}

                {/* Info dispute jika ada di order cancelled */}
                {order.status === 'cancelled' && order.dispute && (
                  <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                    <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Order dibatalkan karena dispute</p>
                    <p className="text-xs text-red-700 dark:text-red-300 mb-1">
                      <span className="font-medium">Alasan:</span> {order.dispute.reason}
                    </p>
                    {order.dispute.resolution && (
                      <p className="text-xs text-red-700 dark:text-red-300">
                        <span className="font-medium">Keputusan admin:</span> {order.dispute.resolution}
                      </p>
                    )}
                    <p className="text-xs text-red-500 mt-1">
                      {order.dispute.status === 'resolved' ? '💰 Dana dikembalikan ke buyer' : ''}
                    </p>
                  </div>
                )}

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