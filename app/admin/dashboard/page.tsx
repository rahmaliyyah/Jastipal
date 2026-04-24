'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminDashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  const [stats, setStats] = useState({
    pendingKyc: 0,
    pendingPayment: 0,
    pendingDisputes: 0,
    totalUsers: 0,
    activeOrders: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [
        { count: pendingKyc },
        { count: pendingPayment },
        { count: pendingDisputes },
        { count: totalUsers },
        { count: activeOrders },
      ] = await Promise.all([
        supabase.from('jastiper_profiles').select('*', { count: 'exact', head: true }).eq('kyc_status', 'pending'),
        supabase.from('escrow_transactions').select('*', { count: 'exact', head: true }).not('payment_proof_url', 'is', null).eq('status', 'held'),
        supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['waiting_payment', 'processing', 'shipped']),
      ])

      setStats({
        pendingKyc: pendingKyc ?? 0,
        pendingPayment: pendingPayment ?? 0,
        pendingDisputes: pendingDisputes ?? 0,
        totalUsers: totalUsers ?? 0,
        activeOrders: activeOrders ?? 0,
      })
      setLoading(false)
    }
    init()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview platform Jastipal</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'KYC Menunggu', value: stats.pendingKyc, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950', href: '/admin/kyc', urgent: stats.pendingKyc > 0 },
              { label: 'Bukti Transfer', value: stats.pendingPayment, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950', href: '/admin/payments', urgent: stats.pendingPayment > 0 },
              { label: 'Disputes', value: stats.pendingDisputes, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950', href: '/admin/disputes', urgent: stats.pendingDisputes > 0 },
              { label: 'Total User', value: stats.totalUsers, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800', href: null, urgent: false },
              { label: 'Order Aktif', value: stats.activeOrders, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950', href: null, urgent: false },
            ].map(card => (
              <div
                key={card.label}
                onClick={() => card.href && router.push(card.href)}
                className={`${card.bg} rounded-xl p-5 ${card.href ? 'cursor-pointer hover:opacity-90 transition-all' : ''} ${card.urgent ? 'ring-2 ring-red-400' : ''}`}
              >
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
                <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                {card.urgent && <p className="text-xs text-red-500 mt-1 font-medium">Perlu ditindak</p>}
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Aksi Cepat</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => router.push('/admin/kyc')} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-left hover:border-gray-300 dark:hover:border-gray-600 transition-all flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-950 flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-600 dark:text-yellow-400">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Verifikasi KYC</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stats.pendingKyc} pengajuan menunggu</p>
                </div>
              </button>

              <button onClick={() => router.push('/admin/payments')} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-left hover:border-gray-300 dark:hover:border-gray-600 transition-all flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Verifikasi Pembayaran</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stats.pendingPayment} bukti transfer menunggu</p>
                </div>
              </button>

              <button onClick={() => router.push('/admin/disputes')} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-left hover:border-gray-300 dark:hover:border-gray-600 transition-all flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600 dark:text-red-400">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Disputes</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stats.pendingDisputes} dispute menunggu</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}