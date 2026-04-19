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
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const statusConfig = {
  open: { label: 'Aktif', color: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300' },
  closed: { label: 'Ditutup', color: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400' },
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
      .eq('status', tab)
      .order('created_at', { ascending: false })

    if (!data) { setTrips([]); setLoading(false); return }

    // hitung produk dengan satu query
    const tripIds = data.map((t: any) => t.id)
    let countMap: Record<string, number> = {}

    if (tripIds.length > 0) {
      const { data: listings } = await supabase
        .from('listings')
        .select('trip_id')
        .in('trip_id', tripIds)
        .eq('status', 'open')
      ;(listings ?? []).forEach((l: any) => {
        countMap[l.trip_id] = (countMap[l.trip_id] ?? 0) + 1
      })
    }

    setTrips(data.map((t: any) => ({ ...t, product_count: countMap[t.id] ?? 0 })))
    setLoading(false)
  }

  async function handleClose(id: string) {
    setActionLoading(id)
    await supabase.from('trips').update({ status: 'closed' }).eq('id', id)
    // tutup semua produk dalam trip
    await supabase.from('listings').update({ status: 'closed' }).eq('trip_id', id)
    setSuccess('Trip berhasil ditutup')
    setActionLoading(null)
    fetchTrips()
  }

  async function handleReopen(id: string) {
    setActionLoading(id)
    await supabase.from('trips').update({ status: 'open' }).eq('id', id)
    await supabase.from('listings').update({ status: 'open' }).eq('trip_id', id)
    setSuccess('Trip berhasil dibuka kembali')
    setActionLoading(null)
    fetchTrips()
  }

  async function handleDelete(id: string) {
    setActionLoading(id)
    // listings akan terhapus otomatis karena ON DELETE CASCADE
    await supabase.from('trips').delete().eq('id', id)
    setSuccess('Trip berhasil dihapus')
    setActionLoading(null)
    fetchTrips()
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Trip Saya</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola trip dan katalog produkmu</p>
        </div>
        <button
          onClick={() => router.push('/trips/new')}
          className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Buat Trip
        </button>
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
        {(['open', 'closed'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {t === 'open' ? 'Aktif' : 'Ditutup'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {tab === 'open' ? 'Belum ada trip aktif' : 'Belum ada trip yang ditutup'}
          </p>
          {tab === 'open' && (
            <button
              onClick={() => router.push('/trips/new')}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-all"
            >
              Buat Trip Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map(trip => (
            <div key={trip.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              {/* Foto trip */}
              {trip.image_url && (
                <img src={trip.image_url} className="w-full h-40 object-cover" alt={trip.title} />
              )}

              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{trip.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(trip.created_at)}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusConfig[trip.status].color}`}>
                    {statusConfig[trip.status].label}
                  </span>
                </div>

                {/* Info */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5">
                    <p className="text-xs text-gray-400 mb-0.5">Negara</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{trip.trip_country}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5">
                    <p className="text-xs text-gray-400 mb-0.5">Tiba</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(trip.arrival_date)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5">
                    <p className="text-xs text-gray-400 mb-0.5">Produk</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{trip.product_count} item</p>
                  </div>
                </div>

                {trip.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-4">"{trip.description}"</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => router.push(`/trips/${trip.id}`)}
                    className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg py-2 text-xs font-medium hover:opacity-90 transition-all"
                  >
                    Lihat Detail
                  </button>
                  <button
                    onClick={() => router.push(`/trips/${trip.id}/products/new`)}
                    className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg py-2 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    + Produk
                  </button>
                  {trip.status === 'open' ? (
                    <button
                      onClick={() => handleClose(trip.id)}
                      disabled={actionLoading === trip.id}
                      className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg py-2 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-all"
                    >
                      {actionLoading === trip.id ? 'Memproses...' : 'Tutup Trip'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReopen(trip.id)}
                      disabled={actionLoading === trip.id}
                      className="flex-1 border border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 rounded-lg py-2 text-xs font-medium hover:bg-green-50 dark:hover:bg-green-950 disabled:opacity-50 transition-all"
                    >
                      {actionLoading === trip.id ? 'Memproses...' : 'Buka Kembali'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(trip.id)}
                    disabled={actionLoading === trip.id}
                    className="border border-red-200 dark:border-red-800 text-red-500 rounded-lg px-3 py-2 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50 transition-all"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}