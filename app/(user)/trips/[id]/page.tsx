'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'

type Trip = {
  id: string
  title: string
  description: string | null
  trip_country: string
  arrival_date: string
  image_url: string | null
  status: 'open' | 'closed'
}

type Product = {
  id: string
  product_name: string
  product_url: string | null
  image_url: string | null
  product_price_idr: number
  service_fee_idr: number
  shipping_fee_idr: number
  total_price_idr: number
  stock: number
  status: 'open' | 'closed'
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function TripDetailPage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const tripId = params.id as string

  const [trip, setTrip] = useState<Trip | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: tripData } = await supabase
        .from('trips')
        .select('id, title, description, trip_country, arrival_date, image_url, status')
        .eq('id', tripId)
        .eq('jastiper_id', user.id)
        .single()

      if (!tripData) { router.push('/trips'); return }
      setTrip(tripData as any)
      fetchProducts()
      setLoading(false)
    }
    init()
  }, [])

  async function fetchProducts() {
    const { data } = await supabase
      .from('listings')
      .select('id, product_name, product_url, image_url, product_price_idr, service_fee_idr, shipping_fee_idr, total_price_idr, stock, status')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })
    setProducts(data ?? [])
  }

  async function handleToggleProduct(product: Product) {
    setActionLoading(product.id)
    const newStatus = product.status === 'open' ? 'closed' : 'open'
    await supabase.from('listings').update({ status: newStatus }).eq('id', product.id)
    setSuccess(`Produk berhasil ${newStatus === 'open' ? 'dibuka' : 'ditutup'}`)
    setActionLoading(null)
    fetchProducts()
    setTimeout(() => setSuccess(''), 3000)
  }

  async function handleDeleteProduct(id: string) {
    setActionLoading(id)
    await supabase.from('listings').delete().eq('id', id)
    setSuccess('Produk berhasil dihapus')
    setActionLoading(null)
    fetchProducts()
    setTimeout(() => setSuccess(''), 3000)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
    </div>
  )

  if (!trip) return null

  const openCount = products.filter(p => p.status === 'open').length
  const closedCount = products.filter(p => p.status === 'closed').length

  return (
    <div className="max-w-2xl">
      {/* Back */}
      <button onClick={() => router.push('/trips')} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 flex items-center gap-1 transition-all">
        ← Kembali ke trip
      </button>

      {/* Trip header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-6">
        {trip.image_url && (
          <img src={trip.image_url} className="w-full h-44 object-cover" alt={trip.title} />
        )}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{trip.title}</h1>
              {trip.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{trip.description}</p>
              )}
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
              trip.status === 'open'
                ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            }`}>
              {trip.status === 'open' ? 'Aktif' : 'Ditutup'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
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
              <p className="text-sm font-medium text-gray-900 dark:text-white">{openCount} aktif · {closedCount} tutup</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success toast */}
      {success && (
        <div className="mb-5 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}

      {/* Products header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Katalog Produk ({products.length})
        </h2>
        <button
          onClick={() => router.push(`/trips/${tripId}/products/new`)}
          className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-all"
        >
          + Tambah Produk
        </button>
      </div>

      {/* Products list */}
      {products.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
          <p className="text-sm text-gray-400 mb-3">Belum ada produk di trip ini</p>
          <button
            onClick={() => router.push(`/trips/${tripId}/products/new`)}
            className="text-sm text-blue-500 hover:text-blue-600 font-medium"
          >
            + Tambah produk pertama
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(product => (
            <div key={product.id} className={`bg-white dark:bg-gray-900 border rounded-xl overflow-hidden ${
              product.status === 'closed'
                ? 'border-gray-200 dark:border-gray-800 opacity-60'
                : 'border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex gap-4 p-4">
                {/* Foto produk */}
                {product.image_url ? (
                  <img src={product.image_url} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.product_name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      product.status === 'open'
                        ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}>
                      {product.status === 'open' ? 'Aktif' : 'Tutup'}
                    </span>
                  </div>

                  {product.product_url && (
                    <a href={product.product_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                      Lihat produk →
                    </a>
                  )}

                  <div className="mt-1 space-y-0.5">
                    {product.service_fee_idr > 0 && (
                      <p className="text-xs text-gray-400">Service fee: {formatRupiah(product.service_fee_idr)}</p>
                    )}
                    {product.shipping_fee_idr > 0 && (
                      <p className="text-xs text-gray-400">Ongkir: {formatRupiah(product.shipping_fee_idr)}</p>
                    )}
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatRupiah(product.total_price_idr)}</p>
                    <p className="text-xs text-gray-400">Stok: {product.stock ?? 1}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 px-4 pb-4">
                <button
                  onClick={() => handleToggleProduct(product)}
                  disabled={actionLoading === product.id}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium disabled:opacity-50 transition-all ${
                    product.status === 'open'
                      ? 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      : 'border border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950'
                  }`}
                >
                  {actionLoading === product.id ? 'Memproses...' : product.status === 'open' ? 'Tutup Produk' : 'Buka Produk'}
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  disabled={actionLoading === product.id}
                  className="border border-red-200 dark:border-red-800 text-red-500 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50 transition-all"
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