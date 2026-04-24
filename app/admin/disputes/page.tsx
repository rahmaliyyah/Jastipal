'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Dispute = {
  id: string
  order_id: string
  reason: string
  status: 'open' | 'resolved' | 'rejected'
  resolution: string | null
  created_at: string
  raised_by_user: { full_name: string; email: string } | null
  order: {
    product_name: string
    status: string
    buyer: { full_name: string } | null
    jastiper: { full_name: string } | null
  } | null
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminDisputesPage() {
  const supabase = createClient()
  const router = useRouter()

  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'open' | 'resolved' | 'rejected'>('open')
  const [selected, setSelected] = useState<Dispute | null>(null)
  const [resolution, setResolution] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [adminId, setAdminId] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setAdminId(user.id)
    }
    init()
  }, [])

  useEffect(() => {
    if (adminId) fetchDisputes()
  }, [adminId, tab])

  async function fetchDisputes() {
    setLoading(true)

    const { data: disputesData } = await supabase
      .from('disputes')
      .select('id, order_id, reason, status, resolution, created_at, raised_by')
      .eq('status', tab)
      .order('created_at', { ascending: false })

    if (!disputesData || disputesData.length === 0) { setDisputes([]); setLoading(false); return }

    // ambil info raised_by
    const raisedByIds = [...new Set(disputesData.map((d: any) => d.raised_by).filter(Boolean))]
    let raisedByMap: Record<string, any> = {}
    if (raisedByIds.length > 0) {
      const { data: usersData } = await supabase
        .from('users')
        .select('id, full_name, email')
        .in('id', raisedByIds)
      ;(usersData ?? []).forEach((u: any) => { raisedByMap[u.id] = u })
    }

    // ambil order info
    const orderIds = disputesData.map((d: any) => d.order_id)
    const { data: ordersData } = await supabase
      .from('orders')
      .select('id, product_name, status, buyer_id, jastiper_id')
      .in('id', orderIds)

    // ambil buyer & jastiper names
    const allUserIds = [...new Set([
      ...(ordersData ?? []).map((o: any) => o.buyer_id),
      ...(ordersData ?? []).map((o: any) => o.jastiper_id),
    ].filter(Boolean))]

    let orderUserMap: Record<string, any> = {}
    if (allUserIds.length > 0) {
      const { data: allUsers } = await supabase
        .from('users')
        .select('id, full_name')
        .in('id', allUserIds)
      ;(allUsers ?? []).forEach((u: any) => { orderUserMap[u.id] = u })
    }

    const orderMap: Record<string, any> = {}
    ;(ordersData ?? []).forEach((o: any) => {
      orderMap[o.id] = {
        product_name: o.product_name,
        status: o.status,
        buyer: orderUserMap[o.buyer_id] ?? null,
        jastiper: orderUserMap[o.jastiper_id] ?? null,
      }
    })

    const mapped = disputesData.map((d: any) => ({
      ...d,
      raised_by_user: raisedByMap[d.raised_by] ?? null,
      order: orderMap[d.order_id] ?? null,
    }))

    setDisputes(mapped)
    setLoading(false)
  }

  async function handleResolve(dispute: Dispute, action: 'refund' | 'release') {
    if (!resolution.trim()) return
    setActionLoading(true)

    // update dispute
    await supabase.from('disputes').update({
      status: 'resolved',
      resolution: resolution,
      resolved_by: adminId,
      resolved_at: new Date().toISOString(),
    }).eq('id', dispute.id)

    if (action === 'refund') {
      // refund ke buyer
      await supabase.from('orders').update({ status: 'cancelled' }).eq('id', dispute.order_id)
      await supabase.from('escrow_transactions').update({
        status: 'refunded',
        released_at: new Date().toISOString(),
        admin_note: resolution,
      }).eq('order_id', dispute.order_id)
    } else {
      // release ke jastiper
      await supabase.from('orders').update({ status: 'delivered' }).eq('id', dispute.order_id)
      await supabase.from('escrow_transactions').update({
        status: 'released',
        released_at: new Date().toISOString(),
        admin_note: resolution,
      }).eq('order_id', dispute.order_id)
    }

    // log admin action
    await supabase.from('admin_actions').insert({
      admin_id: adminId,
      target_order_id: dispute.order_id,
      action_type: action === 'refund' ? 'dispute_refund' : 'dispute_release',
      reason: resolution,
    })

    setSuccess(`Dispute berhasil diselesaikan — ${action === 'refund' ? 'dana dikembalikan ke buyer' : 'dana dicairkan ke jastiper'}`)
    setSelected(null)
    setResolution('')
    setActionLoading(false)
    fetchDisputes()
  }

  async function handleReject(dispute: Dispute) {
    if (!resolution.trim()) return
    setActionLoading(true)

    await supabase.from('disputes').update({
      status: 'rejected',
      resolution: resolution,
      resolved_by: adminId,
      resolved_at: new Date().toISOString(),
    }).eq('id', dispute.id)

    setSuccess('Dispute ditolak')
    setSelected(null)
    setResolution('')
    setActionLoading(false)
    fetchDisputes()
  }

  const statusConfig = {
    open: { label: 'Menunggu', color: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300' },
    resolved: { label: 'Diselesaikan', color: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300' },
    rejected: { label: 'Ditolak', color: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400' },
  }

  return (
    <div>
      {/* Modal resolve */}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Resolve Dispute</h2>
              <button onClick={() => { setSelected(null); setResolution('') }} className="text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Info dispute */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{selected.order?.product_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Buyer: {selected.order?.buyer?.full_name} · Jastiper: {selected.order?.jastiper?.full_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Dibuka oleh: <span className="font-medium text-gray-700 dark:text-gray-300">{selected.raised_by_user?.full_name}</span>
                </p>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-400 mb-1">Alasan:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selected.reason}</p>
                </div>
              </div>

              {/* Resolution note */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Catatan keputusan <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan keputusan admin..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  value={resolution}
                  onChange={e => setResolution(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleResolve(selected, 'refund')}
                    disabled={actionLoading || !resolution.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50 transition-all"
                  >
                    {actionLoading ? 'Memproses...' : '💰 Refund ke Buyer'}
                  </button>
                  <button
                    onClick={() => handleResolve(selected, 'release')}
                    disabled={actionLoading || !resolution.trim()}
                    className="bg-green-500 hover:bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50 transition-all"
                  >
                    {actionLoading ? 'Memproses...' : '✓ Cairkan ke Jastiper'}
                  </button>
                </div>
                <button
                  onClick={() => handleReject(selected)}
                  disabled={actionLoading || !resolution.trim()}
                  className="w-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-all"
                >
                  Tolak Dispute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Disputes</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tangani komplain dari buyer dan jastiper</p>
      </div>

      {/* Success */}
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
        {(['open', 'resolved', 'rejected'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
            {t === 'open' ? 'Menunggu' : t === 'resolved' ? 'Diselesaikan' : 'Ditolak'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      ) : disputes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {tab === 'open' ? 'Tidak ada dispute yang menunggu' : tab === 'resolved' ? 'Belum ada dispute yang diselesaikan' : 'Tidak ada dispute yang ditolak'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map(dispute => (
            <div key={dispute.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{dispute.order?.product_name ?? '-'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Buyer: {dispute.order?.buyer?.full_name} · Jastiper: {dispute.order?.jastiper?.full_name}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusConfig[dispute.status].color}`}>
                  {statusConfig[dispute.status].label}
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-400 mb-1">Alasan dari {dispute.raised_by_user?.full_name}:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{dispute.reason}</p>
              </div>

              {dispute.resolution && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
                  <p className="text-xs text-blue-500 mb-1">Keputusan admin:</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">{dispute.resolution}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400">{formatDate(dispute.created_at)}</p>
                {dispute.status === 'open' && (
                  <button
                    onClick={() => { setSelected(dispute); setResolution('') }}
                    className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-all"
                  >
                    Tangani →
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