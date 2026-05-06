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

      const { count: openCount } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', user.id)
        .eq('status', 'open')
      setOpenRequests(openCount ?? 0)

      const { count: tripCount } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .eq('jastiper_id', user.id)
        .eq('status', 'open')
      setOpenTrips(tripCount ?? 0)

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
    <div className="min-h-screen bg-gray-50">

      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          <span className="rounded-sm">Selamat</span> datang, {userName}! 🙌
        </h1>
        <p className="text-sm text-gray-500">
          {activeRole === 'jastiper'
            ? 'Kamu sedang aktif sebagai jastiper'
            : 'Temukan jastiper terpercaya untuk membantu belanja dari luar negeri'}
        </p>
      </div>

      {/* Alert tagihan masuk */}
      {pendingPaymentCount > 0 && activeRole === 'buyer' && (
        <div
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between cursor-pointer hover:border-blue-300 transition-all"
          onClick={() => router.push('/requests')}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">{pendingPaymentCount} tagihan menunggu pembayaran</p>
              <p className="text-xs text-blue-600">Bayar sebelum kadaluarsa</p>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      )}

      {/* ── MODE BUYER ── */}
      {activeRole === 'buyer' && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Aksi Cepat</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Browse Listing */}
            <div
              onClick={() => router.push('/browse-listings')}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer"
            >
              <div className="w-10 h-10 bg-[#49BC9E] rounded-lg flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </div>
              <p className="font-bold text-gray-900 mb-1">Browse Listing</p>
              <p className="text-sm text-gray-500">Cari jastiper yang siap berangkat</p>
            </div>

            {/* Buat Request */}
            <div
              onClick={() => router.push('/requests/new')}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer"
            >
              <div className="w-10 h-10 bg-[#49BC9E] rounded-lg flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="font-bold text-gray-900 mb-1">Buat Request</p>
              <p className="text-sm text-gray-500">Minta jastiper belikan barang</p>
            </div>
          </div>

          {/* Request Saya */}
          <div
            onClick={() => router.push('/requests')}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#49BC9E] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-900">Request Saya</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm text-gray-500">{openRequests} Aktif</p>
                  {pendingPaymentCount > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                      {pendingPaymentCount} tagihan
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODE JASTIPER ── */}
      {activeRole === 'jastiper' && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Aksi Cepat</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Browse Request */}
            <div
              onClick={() => router.push('/browse-requests')}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer"
            >
              <div className="w-10 h-10 bg-[#49BC9E] rounded-lg flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </div>
              <p className="font-bold text-gray-900 mb-1">Browse Request</p>
              <p className="text-sm text-gray-500">Cari request yang bisa diambil</p>
            </div>

            {/* Buat Trip */}
            <div
              onClick={() => router.push('/trips/new')}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer"
            >
              <div className="w-10 h-10 bg-[#49BC9E] rounded-lg flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="font-bold text-gray-900 mb-1">Buat Trip</p>
              <p className="text-sm text-gray-500">Upload trip & katalog produkmu</p>
            </div>
          </div>

          {/* Order Masuk */}
          <div
            onClick={() => router.push('/orders')}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer mb-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#49BC9E] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-900">Order Masuk</p>
                <p className="text-sm text-gray-500">Lihat order yang perlu diproses</p>
              </div>
            </div>
          </div>

          {/* Trip Saya */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">Trip Saya</h2>
              <button onClick={() => router.push('/trips')} className="text-xs text-[#49BC9E] hover:underline">Lihat semua →</button>
            </div>
            <div
              onClick={() => router.push('/trips')}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer"
            >
              {openTrips > 0 ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{openTrips}</p>
                    <p className="text-sm text-gray-500">trip aktif</p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Belum ada trip aktif</p>
                  <button
                    onClick={e => { e.stopPropagation(); router.push('/trips/new') }}
                    className="text-xs text-[#49BC9E] hover:underline font-medium"
                  >
                    + Buat trip baru
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}