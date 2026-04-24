'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const [adminName, setAdminName] = useState('')
  const [pendingKyc, setPendingKyc] = useState(0)
  const [pendingPayment, setPendingPayment] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('users')
        .select('full_name, is_admin')
        .eq('id', user.id)
        .single()

      if (!data?.is_admin) { router.push('/dashboard'); return }
      setAdminName(data.full_name ?? 'Admin')

      // hitung pending KYC
      const { count: kycCount } = await supabase
        .from('jastiper_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('kyc_status', 'pending')
      setPendingKyc(kycCount ?? 0)

      // hitung bukti transfer yang belum diverifikasi
      const { count: payCount } = await supabase
        .from('escrow_transactions')
        .select('*', { count: 'exact', head: true })
        .not('payment_proof_url', 'is', null)
        .eq('status', 'held')
      setPendingPayment(payCount ?? 0)
    }
    init()
  }, [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function isActive(path: string) {
    return pathname === path || pathname.startsWith(path + '/')
  }

  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
      ),
    },
    {
      href: '/admin/kyc',
      label: 'Verifikasi KYC',
      badge: pendingKyc > 0 ? pendingKyc : null,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
    {
      href: '/admin/payments',
      label: 'Verifikasi Bayar',
      badge: pendingPayment > 0 ? pendingPayment : null,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
    },
    {
      href: '/admin/users',
      label: 'Users',
      badge: null,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      href: '/admin/disputes',
      label: 'Disputes',
      badge: null,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo + badge admin */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="font-bold text-gray-900 dark:text-white text-lg">
              Jastipal
            </Link>
            <span className="text-xs font-medium px-2 py-0.5 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full">
              Admin
            </span>
          </div>

          {/* Nav items */}
          <div className="hidden sm:flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {item.icon}
                {item.label}
                {item.badge && (
                  <span className="ml-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Admin info + logout */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 hover:opacity-80 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-xs font-semibold text-red-600 dark:text-red-300 uppercase">
                {adminName[0] ?? 'A'}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                {adminName}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="hidden sm:block text-gray-400">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Login sebagai</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{adminName}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Keluar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile bottom bar */}
        <div className="sm:hidden flex border-t border-gray-200 dark:border-gray-800">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-all ${
                isActive(item.href)
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {item.icon}
              {item.label}
              {item.badge && (
                <span className="absolute top-1.5 right-1/4 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}