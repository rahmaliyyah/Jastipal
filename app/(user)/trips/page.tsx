'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Trip = {
  id: string
  title: string
  description: string | null
  trip_country: string
  arrival_date: string
  image_url: string | null
  status: 'open' | 'closed'
  created_at: string
  product_count: number
  has_active_orders: boolean
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function MyTripsPage() {
  const supabase = createClient()
  const router = useRouter()

  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'open' | 'closed'>('open')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('users')
        .select('is_jastiper, active_role')
        .eq('id', user.id)
        .single()

      if (!data?.is_jastiper || data.active_role !== 'jastiper') {
        router.push('/dashboard')
        return
      }

      setUserId(user.id)
    }
    init()
  }, [])

  useEffect(() => {
    if (userId) fetchTrips()
  }, [userId, tab])

  async function fetchTrips() {
    setLoading(true)

    const { data } = await supabase
      .from('trips')
      .select('id, title, description, trip_country, arrival_date, image_url, status, created_at')
      .eq('jastiper_id', userId)
      .order('created_at', { ascending: false })

    const filtered = (data ?? []).filter((t: any) => {
      if (tab === 'closed') return t.status === 'closed'
      return t.status === 'open'
    })
    const filteredData = filtered

    if (!filteredData) { setTrips([]); setLoading(false); return }

    const tripIds = filteredData.map((t: any) => t.id)
    let countMap: Record<string, number> = {}
    let activeOrdersMap: Record<string, boolean> = {}

    if (tripIds.length > 0) {
      const { data: listings } = await supabase
        .from('listings')
        .select('trip_id')
        .in('trip_id', tripIds)
        .eq('status', 'open')
      ;(listings ?? []).forEach((l: any) => {
        countMap[l.trip_id] = (countMap[l.trip_id] ?? 0) + 1
      })

      const listingIds = (await supabase
        .from('listings')
        .select('id, trip_id')
        .in('trip_id', tripIds)
      ).data ?? []

      const listingTripMap: Record<string, string> = {}
      listingIds.forEach((l: any) => { listingTripMap[l.id] = l.trip_id })

      const { data: activeOrders } = await supabase
        .from('orders')
        .select('listing_id')
        .in('listing_id', listingIds.map((l: any) => l.id))
        .in('status', ['waiting_payment', 'processing', 'shipped'])

      ;(activeOrders ?? []).forEach((o: any) => {
        const tripId = listingTripMap[o.listing_id]
        if (tripId) activeOrdersMap[tripId] = true
      })
    }

    setTrips(filteredData.map((t: any) => ({
      ...t,
      product_count: countMap[t.id] ?? 0,
      has_active_orders: activeOrdersMap[t.id] ?? false,
    })))
    setLoading(false)
  }

  async function handleClose(id: string) {
    setActionLoading(id)
    await supabase.from('trips').update({ status: 'closed' }).eq('id', id)
    setSuccess('Trip berhasil ditutup')
    setActionLoading(null)
    fetchTrips()
  }

  async function handleReopen(id: string) {
    setActionLoading(id)
    await supabase.from('trips').update({ status: 'open' }).eq('id', id)
    setSuccess('Trip berhasil dibuka kembali')
    setActionLoading(null)
    fetchTrips()
  }

  async function handleDelete(id: string) {
    setActionLoading(id)
    await supabase.from('trips').delete().eq('id', id)
    setSuccess('Trip berhasil dihapus')
    setActionLoading(null)
    fetchTrips()
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 sm:py-2">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[28px] font-bold text-[#0F172A]">Perjalanan Saya</h1>
            <p className="mt-1 text-[15px] text-[#64748B]">Kelola perjalanan dan produk jastip Anda</p>
          </div>
          <button
            onClick={() => router.push('/trips/new')}
            className="h-[44px] px-6 rounded-xl bg-[#49BC9E] hover:bg-[#3da88d] text-white font-semibold text-[15px] transition-all shadow-md shadow-teal-100 whitespace-nowrap"
          >
            + Buat Perjalanan
          </button>
        </div>

        {/* Success toast */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <p className="text-[14px] text-green-700 font-medium">{success}</p>
            <button onClick={() => setSuccess('')} className="text-green-400 ml-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}

        {/* Toggle Tabs */}
        <div className="inline-flex bg-[#1E293B] rounded-xl p-1 mb-6">
          {(['open', 'closed'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-[14px] font-semibold capitalize transition-all ${
                tab === t
                  ? 'bg-white text-[#0F172A]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {t === 'open' ? 'Aktif' : 'Ditutup'}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#CBD5E1] border-t-[#49BC9E] rounded-full animate-spin"></div>
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-white border border-[#CBD5E1] rounded-2xl p-12 flex flex-col items-center gap-3">
            <p className="text-[16px] text-[#94A3B8]">
              {tab === 'open' ? 'Belum ada perjalanan aktif.' : 'Belum ada perjalanan yang ditutup.'}
            </p>
            {tab === 'open' && (
              <button
                onClick={() => router.push('/trips/new')}
                className="mt-2 h-[44px] px-6 rounded-xl bg-[#49BC9E] hover:bg-[#3da88d] text-white font-semibold text-[15px] transition-all"
              >
                Buat Perjalanan
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {trips.map(trip => (
              <div key={trip.id} className="bg-white border border-[#CBD5E1] rounded-2xl overflow-hidden">

                {/* Cover image */}
                <div className="h-[240px] w-full bg-[#CBD5E1] overflow-hidden">
                  {trip.image_url ? (
                    <img
                      src={trip.image_url}
                      alt={trip.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget
                        target.style.display = 'none'
                        target.parentElement!.style.background = 'linear-gradient(135deg, #49BC9E 0%, #2563EB 100%)'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #49BC9E 0%, #2563EB 100%)' }} />
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-[22px] font-bold text-[#0F172A] mb-4">{trip.title}</h2>

                  {/* Info grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-[#F8FAFC] rounded-xl p-3">
                      <p className="text-[12px] text-[#94A3B8] font-medium mb-1">Negara</p>
                      <p className="text-[15px] font-semibold text-[#0F172A]">{trip.trip_country}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-xl p-3">
                      <p className="text-[12px] text-[#94A3B8] font-medium mb-1">Tanggal Tiba</p>
                      <p className="text-[15px] font-semibold text-[#0F172A]">{formatDate(trip.arrival_date)}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-xl p-3">
                      <p className="text-[12px] text-[#94A3B8] font-medium mb-1">Produk</p>
                      <p className="text-[15px] font-semibold text-[#0F172A]">{trip.product_count} item</p>
                    </div>
                  </div>

                  {/* Description */}
                  {trip.description && (
                    <div className="bg-[#F8FAFC] rounded-xl p-3 mb-5">
                      <p className="text-[12px] text-[#94A3B8] font-medium mb-1">Deskripsi</p>
                      <p className="text-[14px] text-[#1E293B]">{trip.description}</p>
                    </div>
                  )}

                  {/* Active orders warning */}
                  {trip.has_active_orders && tab === 'open' && (
                    <p className="text-[13px] text-red-500 font-semibold mb-4">Ada order aktif, trip tidak bisa ditutup</p>
                  )}

                  {/* Actions */}
                  <div className={`grid gap-3 ${trip.has_active_orders ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    <button
                      onClick={() => router.push(`/trips/${trip.id}`)}
                      className="h-[48px] rounded-xl bg-[#49BC9E] hover:bg-[#3da88d] text-white font-semibold text-[15px] transition-all"
                    >
                      Lihat Detail
                    </button>

                    {tab === 'open' ? (
                      <button
                        onClick={() => router.push(`/trips/${trip.id}/products/new`)}
                        className="h-[48px] rounded-xl border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] font-semibold text-[15px] transition-all"
                      >
                        Tambah Produk
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReopen(trip.id)}
                        disabled={actionLoading === trip.id}
                        className="h-[48px] rounded-xl border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] font-semibold text-[15px] disabled:opacity-50 transition-all"
                      >
                        {actionLoading === trip.id ? '...' : 'Buka Kembali'}
                      </button>
                    )}

                    {!trip.has_active_orders && (
                      tab === 'open' ? (
                        <button
                          onClick={() => handleClose(trip.id)}
                          disabled={actionLoading === trip.id}
                          className="h-[48px] rounded-xl border border-[#CBD5E1] hover:bg-[#FEF2F2] hover:border-[#FECACA] text-[#64748B] hover:text-[#DC2626] font-semibold text-[15px] disabled:opacity-50 transition-all"
                        >
                          {actionLoading === trip.id ? '...' : 'Tutup'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelete(trip.id)}
                          disabled={actionLoading === trip.id}
                          className="h-[48px] rounded-xl border border-[#CBD5E1] hover:bg-[#FEF2F2] hover:border-[#FECACA] text-[#64748B] hover:text-[#DC2626] font-semibold text-[15px] disabled:opacity-50 transition-all"
                        >
                          {actionLoading === trip.id ? '...' : 'Hapus'}
                        </button>
                      )
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}