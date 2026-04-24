'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  const [userName, setUserName] = useState('')
  const [isJastiper, setIsJastiper] = useState(false)
  const [activeRole, setActiveRole] = useState<'buyer' | 'jastiper'>('buyer')
  const [openRequests, setOpenRequests] = useState(0)
  const [pendingPaymentCount, setPendingPaymentCount] = useState(0)
  const [openTrips, setOpenTrips] = useState(0)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('users')
        .select('full_name, is_jastiper, active_role')
        .eq('id', user.id)
        .single()

      if (data) {
        setUserName(data.full_name)
        setIsJastiper(data.is_jastiper)
        setActiveRole(data.active_role ?? 'buyer')
      }

      // hitung request open
      const { count: openCount } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', user.id)
        .eq('status', 'open')

      setOpenRequests(openCount ?? 0)

      // hitung trip aktif jastiper
      const { count: tripCount } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .eq('jastiper_id', user.id)
        .eq('status', 'open')
      setOpenTrips(tripCount ?? 0)

      // hitung tagihan yang benar-benar waiting_payment
      // ambil semua request matched milik buyer
      const { data: matchedRequests } = await supabase
        .from('requests')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('status', 'matched')

      if (matchedRequests && matchedRequests.length > 0) {
        const requestIds = matchedRequests.map((r: any) => r.id)
        const { count: waitingCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .in('request_id', requestIds)
          .eq('status', 'waiting_payment')

        setPendingPaymentCount(waitingCount ?? 0)
      }
    }
    getUser()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Selamat datang, {userName} 👋
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {activeRole === 'jastiper'
            ? 'Kamu sedang aktif sebagai jastiper'
            : 'Temukan jastiper terpercaya untuk belanja dari luar negeri'}
        </p>
      </div>

      {/* Alert tagihan masuk */}
      {pendingPaymentCount > 0 && activeRole === 'buyer' && (
        <div
          className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 flex items-center justify-between cursor-pointer hover:border-blue-300 transition-all"
          onClick={() => router.push('/requests')}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">{pendingPaymentCount} tagihan menunggu pembayaran</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Bayar sebelum kadaluarsa</p>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      )}

      {/* Mode buyer */}
      {activeRole === 'buyer' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Aksi Cepat</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push('/browse-listings')}
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl p-4 text-left hover:opacity-90 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 dark:bg-gray-900/20 flex items-center justify-center mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <p className="text-sm font-semibold">Browse Listing</p>
                <p className="text-xs opacity-70 mt-0.5">Cari jastiper yang siap berangkat</p>
              </button>

              <button
                onClick={() => router.push('/requests/new')}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-left hover:border-gray-300 dark:hover:border-gray-600 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 dark:text-gray-400">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Buat Request</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Minta jastiper belikan barang</p>
              </button>

              <button
                onClick={() => router.push('/requests')}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-left hover:border-gray-300 dark:hover:border-gray-600 transition-all col-span-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 dark:text-gray-400">
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Request Saya</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{openRequests} aktif</p>
                      {pendingPaymentCount > 0 && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-medium">
                          {pendingPaymentCount} tagihan
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>


        </div>
      )}

      {/* Mode jastiper */}
      {activeRole === 'jastiper' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Aksi Cepat</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push('/browse-requests')}
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl p-4 text-left hover:opacity-90 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 dark:bg-gray-900/20 flex items-center justify-center mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <p className="text-sm font-semibold">Browse Request</p>
                <p className="text-xs opacity-70 mt-0.5">Cari request yang bisa diambil</p>
              </button>

              <button
                onClick={() => router.push('/trips/new')}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-left hover:border-gray-300 dark:hover:border-gray-600 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 dark:text-gray-400">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Buat Trip</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Upload trip & katalog produkmu</p>
              </button>

              <button
                onClick={() => router.push('/orders')}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-left hover:border-gray-300 dark:hover:border-gray-600 transition-all col-span-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 dark:text-gray-400">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Order Masuk</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Lihat order yang perlu diproses</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Trip Saya</h2>
              <button onClick={() => router.push('/trips')} className="text-xs text-blue-500 hover:text-blue-600">Lihat semua →</button>
            </div>
            <div
              onClick={() => router.push('/trips')}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-all"
            >
              {openTrips > 0 ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{openTrips}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">trip aktif</p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-400 dark:text-gray-500 text-sm mb-2">Belum ada trip aktif</p>
                  <button onClick={(e) => { e.stopPropagation(); router.push('/trips/new') }} className="text-xs text-blue-500 hover:text-blue-600 font-medium">+ Buat trip baru</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}