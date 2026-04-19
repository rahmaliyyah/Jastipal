'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Listing = {
  id: string
  title: string
  description: string | null
  trip_country: string
  arrival_date: string
  max_weight_kg: number | null
  product_name: string
  product_url: string | null
  product_price_idr: number
  service_fee_idr: number
  shipping_fee_idr: number
  total_price_idr: number
  status: 'open' | 'closed' | 'expired'
  created_at: string
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const statusConfig = {
  open: { label: 'Aktif', color: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300' },
  closed: { label: 'Ditutup', color: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400' },
  expired: { label: 'Kadaluarsa', color: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400' },
}

export default function MyListingsPage() {
  const supabase = createClient()
  const router = useRouter()

  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'open' | 'closed' | 'expired'>('open')
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
    if (userId) fetchListings()
  }, [userId, tab])

  async function fetchListings() {
    setLoading(true)
    const { data } = await supabase
      .from('listings')
      .select('id, title, description, trip_country, arrival_date, max_weight_kg, product_name, product_url, product_price_idr, service_fee_idr, shipping_fee_idr, total_price_idr, status, created_at')
      .eq('jastiper_id', userId)
      .eq('status', tab)
      .order('created_at', { ascending: false })

    setListings(data ?? [])
    setLoading(false)
  }

  async function handleClose(id: string) {
    setActionLoading(id)
    await supabase.from('listings').update({ status: 'closed' }).eq('id', id)
    setSuccess('Listing berhasil ditutup')
    setActionLoading(null)
    fetchListings()
  }

  async function handleReopen(id: string) {
    setActionLoading(id)
    await supabase.from('listings').update({ status: 'open' }).eq('id', id)
    setSuccess('Listing berhasil dibuka kembali')
    setActionLoading(null)
    fetchListings()
  }

  async function handleDelete(id: string) {
    setActionLoading(id)
    await supabase.from('listings').delete().eq('id', id)
    setSuccess('Listing berhasil dihapus')
    setActionLoading(null)
    fetchListings()
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Listing Saya</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola listing jasa titip kamu</p>
        </div>
        <button
          onClick={() => router.push('/listings/new')}
          className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Buat Listing
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
        {(['open', 'closed', 'expired'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {t === 'open' ? 'Aktif' : t === 'closed' ? 'Ditutup' : 'Kadaluarsa'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {tab === 'open' ? 'Belum ada listing aktif' : tab === 'closed' ? 'Belum ada listing yang ditutup' : 'Tidak ada listing yang kadaluarsa'}
          </p>
          {tab === 'open' && (
            <button
              onClick={() => router.push('/listings/new')}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-all"
            >
              Buat Listing Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map(listing => (
            <div key={listing.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white">{listing.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(listing.created_at)}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusConfig[listing.status].color}`}>
                  {statusConfig[listing.status].label}
                </span>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Negara</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{listing.trip_country}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Tiba</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(listing.arrival_date)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Produk</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{listing.product_name}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Max berat</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{listing.max_weight_kg ? `${listing.max_weight_kg} kg` : '-'}</p>
                </div>
              </div>

              {/* Harga */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4 space-y-1">
                {listing.service_fee_idr > 0 && (
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Harga produk</span>
                    <span>{formatRupiah(listing.product_price_idr)}</span>
                  </div>
                )}
                {listing.service_fee_idr > 0 && (
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Service fee</span>
                    <span>{formatRupiah(listing.service_fee_idr)}</span>
                  </div>
                )}
                {listing.shipping_fee_idr > 0 && (
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Ongkir</span>
                    <span>{formatRupiah(listing.shipping_fee_idr)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold text-gray-900 dark:text-white pt-1 border-t border-gray-200 dark:border-gray-700">
                  <span>Total listing</span>
                  <span>{formatRupiah(listing.total_price_idr)}</span>
                </div>
              </div>

              {listing.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-4">"{listing.description}"</p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                {listing.status === 'open' && (
                  <button
                    onClick={() => handleClose(listing.id)}
                    disabled={actionLoading === listing.id}
                    className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg py-2 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-all"
                  >
                    {actionLoading === listing.id ? 'Memproses...' : 'Tutup Listing'}
                  </button>
                )}
                {listing.status === 'closed' && (
                  <button
                    onClick={() => handleReopen(listing.id)}
                    disabled={actionLoading === listing.id}
                    className="flex-1 border border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 rounded-lg py-2 text-xs font-medium hover:bg-green-50 dark:hover:bg-green-950 disabled:opacity-50 transition-all"
                  >
                    {actionLoading === listing.id ? 'Memproses...' : 'Buka Kembali'}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(listing.id)}
                  disabled={actionLoading === listing.id}
                  className="border border-red-200 dark:border-red-800 text-red-500 rounded-lg px-3 py-2 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50 transition-all"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}