'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type PaymentItem = {
  id: string
  order_id: string
  amount_idr: number
  payment_method: string | null
  payment_proof_url: string | null
  paid_at: string | null
  status: string
  admin_note: string | null
  order: {
    id: string
    product_name: string
    flow_type: string
    delivery_pref: string
    buyer: { full_name: string; email: string } | null
    jastiper: { full_name: string } | null
  } | null
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminPaymentsPage() {
  const supabase = createClient()
  const router = useRouter()

  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<PaymentItem | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [previewImg, setPreviewImg] = useState<string | null>(null)
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending')

  useEffect(() => { fetchPayments() }, [tab])

  async function fetchPayments() {
    setLoading(true)

    // ambil escrow yang sudah ada bukti transfer
    const { data: escrowData } = await supabase
      .from('escrow_transactions')
      .select('id, order_id, amount_idr, payment_method, payment_proof_url, paid_at, status, admin_note')
      .not('payment_proof_url', 'is', null)
      .eq('status', tab === 'pending' ? 'held' : tab === 'approved' ? 'released' : 'refunded')
      .order('paid_at', { ascending: false })

    if (!escrowData || escrowData.length === 0) {
      setPayments([])
      setLoading(false)
      return
    }

    // ambil order info terpisah
    const orderIds = escrowData.map((e: any) => e.order_id)
    const { data: ordersData } = await supabase
      .from('orders')
      .select('id, product_name, flow_type, delivery_pref, buyer_id, jastiper_id')
      .in('id', orderIds)

    // ambil buyer dan jastiper info
    const userIds = [...new Set([
      ...(ordersData ?? []).map((o: any) => o.buyer_id),
      ...(ordersData ?? []).map((o: any) => o.jastiper_id),
    ].filter(Boolean))]

    const { data: usersData } = await supabase
      .from('users')
      .select('id, full_name, email')
      .in('id', userIds)

    const userMap: Record<string, any> = {}
    ;(usersData ?? []).forEach((u: any) => { userMap[u.id] = u })

    const orderMap: Record<string, any> = {}
    ;(ordersData ?? []).forEach((o: any) => {
      orderMap[o.id] = {
        ...o,
        buyer: userMap[o.buyer_id] ?? null,
        jastiper: userMap[o.jastiper_id] ?? null,
      }
    })

    const mapped = escrowData.map((e: any) => ({
      ...e,
      order: orderMap[e.order_id] ?? null,
    }))

    setPayments(mapped)
    setLoading(false)
  }

  async function handleApprove(payment: PaymentItem) {
    setActionLoading(true)

    // update escrow jadi released
    await supabase.from('escrow_transactions').update({
      status: 'released',
      released_at: new Date().toISOString(),
      admin_note: adminNote || null,
    }).eq('id', payment.id)

    // update order jadi processing
    await supabase.from('orders').update({
      status: 'processing',
    }).eq('id', payment.order_id)

    setSuccess(`Pembayaran disetujui — order ${payment.order?.product_name} diproses jastiper`)
    setSelected(null)
    setAdminNote('')
    setActionLoading(false)
    fetchPayments()
  }

  async function handleReject(payment: PaymentItem) {
    if (!adminNote.trim()) return
    setActionLoading(true)

    // update escrow jadi refunded
    await supabase.from('escrow_transactions').update({
      status: 'refunded',
      admin_note: adminNote,
    }).eq('id', payment.id)

    // update order jadi cancelled
    await supabase.from('orders').update({
      status: 'cancelled',
    }).eq('id', payment.order_id)

    setSuccess(`Pembayaran ditolak — order ${payment.order?.product_name} dibatalkan`)
    setSelected(null)
    setAdminNote('')
    setActionLoading(false)
    fetchPayments()
  }

  return (
    <div>
      {/* Image preview modal */}
      {previewImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewImg(null)}
        >
          <img src={previewImg} alt="Bukti transfer" className="max-w-full max-h-[90vh] rounded-xl object-contain" />
          <p className="absolute bottom-6 text-white text-sm opacity-70">Klik mana saja untuk tutup</p>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Detail Bukti Transfer</h2>
              <button
                onClick={() => { setSelected(null); setAdminNote('') }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Order info */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{selected.order?.product_name ?? '-'}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <div>
                    <p className="mb-0.5">Buyer</p>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{selected.order?.buyer?.full_name ?? '-'}</p>
                    <p>{selected.order?.buyer?.email ?? ''}</p>
                  </div>
                  <div>
                    <p className="mb-0.5">Jastiper</p>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{selected.order?.jastiper?.full_name ?? '-'}</p>
                  </div>
                </div>
              </div>

              {/* Payment info */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Total dibayar</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatRupiah(selected.amount_idr)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Metode</span>
                  <span className="text-gray-700 dark:text-gray-300">{selected.payment_method ?? '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Waktu transfer</span>
                  <span className="text-gray-700 dark:text-gray-300">{selected.paid_at ? formatDate(selected.paid_at) : '-'}</span>
                </div>
              </div>

              {/* Bukti transfer */}
              {selected.payment_proof_url && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Bukti Transfer</p>
                  <div
                    className="cursor-pointer rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:opacity-90 transition-all"
                    onClick={() => setPreviewImg(selected.payment_proof_url)}
                  >
                    <img
                      src={selected.payment_proof_url}
                      alt="Bukti transfer"
                      className="w-full h-48 object-cover"
                    />
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 py-2">Klik untuk perbesar</p>
                  </div>
                </div>
              )}

              {/* Admin note */}
              {tab === 'pending' && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block uppercase tracking-wide">
                    Catatan admin (opsional untuk approve, wajib untuk tolak)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Nominal tidak sesuai, transfer beda bank, dll"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                  />
                </div>
              )}

              {/* Existing admin note (approved/rejected) */}
              {tab !== 'pending' && selected.admin_note && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Catatan admin</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selected.admin_note}</p>
                </div>
              )}

              {/* Actions */}
              {tab === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReject(selected)}
                    disabled={actionLoading || !adminNote.trim()}
                    className="flex-1 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg py-2.5 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-40 transition-all"
                  >
                    {actionLoading ? 'Memproses...' : 'Tolak'}
                  </button>
                  <button
                    onClick={() => handleApprove(selected)}
                    disabled={actionLoading}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-40 transition-all"
                  >
                    {actionLoading ? 'Memproses...' : 'Setujui'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Verifikasi Pembayaran</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cek dan approve bukti transfer dari buyer</p>
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
        {(['pending', 'approved', 'rejected'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {t === 'pending' ? 'Menunggu' : t === 'approved' ? 'Disetujui' : 'Ditolak'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {tab === 'pending' ? 'Tidak ada bukti transfer yang menunggu' : tab === 'approved' ? 'Belum ada pembayaran yang disetujui' : 'Tidak ada pembayaran yang ditolak'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {payments.map(payment => (
            <div
              key={payment.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer"
              onClick={() => { setSelected(payment); setAdminNote('') }}
            >
              {/* Thumbnail bukti transfer */}
              {payment.payment_proof_url && (
                <div className="h-32 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <img
                    src={payment.payment_proof_url}
                    alt="Bukti"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {payment.order?.product_name ?? '-'}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    tab === 'pending'
                      ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300'
                      : tab === 'approved'
                      ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                  }`}>
                    {tab === 'pending' ? 'Menunggu' : tab === 'approved' ? 'Disetujui' : 'Ditolak'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <p>👤 Buyer: <span className="text-gray-700 dark:text-gray-300">{payment.order?.buyer?.full_name ?? '-'}</span></p>
                  <p>💳 {payment.payment_method ?? 'Metode tidak diketahui'}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatRupiah(payment.amount_idr)}</p>
                  {payment.paid_at && <p>🕐 {formatDate(payment.paid_at)}</p>}
                </div>

                {tab === 'pending' && (
                  <p className="text-xs text-blue-500 mt-3 font-medium">Klik untuk review →</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}