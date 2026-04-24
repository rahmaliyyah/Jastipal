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
  description: string | null
  stock: number
  status: 'open' | 'closed'
  has_orders?: boolean
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isTripExpired(arrival_date: string) {
  return new Date(arrival_date) < new Date(new Date().toDateString())
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

  // edit modal state
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [editForm, setEditForm] = useState({ product_name: '', description: '', product_price_idr: '', service_fee_idr: '', shipping_fee_idr: '', stock: '' })
  const [editLoading, setEditLoading] = useState(false)

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
      await fetchProducts()
      setLoading(false)
    }
    init()
  }, [])

  async function fetchProducts() {
    const { data } = await supabase
      .from('listings')
      .select('id, product_name, description, product_url, image_url, product_price_idr, service_fee_idr, shipping_fee_idr, total_price_idr, stock, status')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })

    if (!data) { setProducts([]); return }

    // cek produk mana yang sudah ada order
    const productIds = data.map((p: any) => p.id)
    let orderMap: Record<string, boolean> = {}
    if (productIds.length > 0) {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('listing_id')
        .in('listing_id', productIds)
      ;(ordersData ?? []).forEach((o: any) => { orderMap[o.listing_id] = true })
    }

    setProducts(data.map((p: any) => ({ ...p, has_orders: orderMap[p.id] ?? false })))
  }

  async function handleDeleteProduct(id: string) {
    setActionLoading(id)
    await supabase.from('listings').delete().eq('id', id)
    setSuccess('Produk berhasil dihapus')
    setActionLoading(null)
    fetchProducts()
    setTimeout(() => setSuccess(''), 3000)
  }

  async function handleSaveEdit() {
    if (!editProduct) return
    setEditLoading(true)
    const price = parseFloat(editForm.product_price_idr) || 0
    const service = parseFloat(editForm.service_fee_idr) || 0
    const shipping = parseFloat(editForm.shipping_fee_idr) || 0
    const total = price + service + shipping

    await supabase.from('listings').update({
      product_name: editForm.product_name,
      description: editForm.description || null,
      product_price_idr: price,
      service_fee_idr: service,
      shipping_fee_idr: shipping,
      total_price_idr: total,
      stock: parseInt(editForm.stock) || 1,
    }).eq('id', editProduct.id)

    setSuccess('Produk berhasil diperbarui')
    setEditProduct(null)
    setEditLoading(false)
    fetchProducts()
    setTimeout(() => setSuccess(''), 3000)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
    </div>
  )

  if (!trip) return null

  const expired = isTripExpired(trip.arrival_date)
  const openCount = products.filter(p => p.stock > 0).length
  const soldOutCount = products.filter(p => p.stock === 0).length

  return (
    <div className="max-w-2xl">
      {/* Edit modal */}
      {editProduct && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md shadow-2xl">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Edit Produk</h2>
              <button onClick={() => setEditProduct(null)} className="text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Nama produk</label>
                <input
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={editForm.product_name}
                  onChange={e => setEditForm({ ...editForm, product_name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Deskripsi</label>
                <textarea
                  rows={2}
                  placeholder="Warna, ukuran, varian..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'product_price_idr', label: 'Harga produk' },
                  { key: 'service_fee_idr', label: 'Service fee' },
                  { key: 'shipping_fee_idr', label: 'Ongkir' },
                  { key: 'stock', label: 'Stok' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">{f.label}</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      value={(editForm as any)[f.key]}
                      onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
              {/* Total preview */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex justify-between text-sm font-semibold text-gray-900 dark:text-white">
                  <span>Total listing</span>
                  <span>{formatRupiah((parseFloat(editForm.product_price_idr) || 0) + (parseFloat(editForm.service_fee_idr) || 0) + (parseFloat(editForm.shipping_fee_idr) || 0))}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditProduct(null)} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                  Batal
                </button>
                <button onClick={handleSaveEdit} disabled={editLoading} className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all">
                  {editLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              expired
                ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                : 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
            }`}>
              {expired ? 'Kadaluarsa' : 'Aktif'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5">
              <p className="text-xs text-gray-400 mb-0.5">Negara</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{trip.trip_country}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5">
              <p className="text-xs text-gray-400 mb-0.5">Tiba</p>
              <p className={`text-sm font-medium ${expired ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{formatDate(trip.arrival_date)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5">
              <p className="text-xs text-gray-400 mb-0.5">Produk</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{openCount} ada · {soldOutCount} habis</p>
            </div>
          </div>

          {expired && (
            <div className="mt-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              <p className="text-xs text-red-600 dark:text-red-400">Trip ini sudah melewati tanggal tiba — produk tidak bisa dipesan oleh buyer.</p>
            </div>
          )}
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
        {!expired && (
          <button
            onClick={() => router.push(`/trips/${tripId}/products/new`)}
            className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-all"
          >
            + Tambah Produk
          </button>
        )}
      </div>

      {/* Products list */}
      {products.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
          <p className="text-sm text-gray-400 mb-3">Belum ada produk di trip ini</p>
          {!expired && (
            <button onClick={() => router.push(`/trips/${tripId}/products/new`)} className="text-sm text-blue-500 hover:text-blue-600 font-medium">
              + Tambah produk pertama
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(product => (
            <div key={product.id} className={`bg-white dark:bg-gray-900 border rounded-xl overflow-hidden ${
              product.stock === 0 ? 'border-gray-200 dark:border-gray-800 opacity-60' : 'border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex gap-4 p-4">
                {/* Foto */}
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
                      product.stock === 0
                        ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                        : 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                    }`}>
                      {product.stock === 0 ? 'Stok Habis' : `Stok: ${product.stock}`}
                    </span>
                  </div>

                  <div className="mt-1 space-y-0.5">
                    {product.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-1">{product.description}</p>
                    )}
                    {product.service_fee_idr > 0 && (
                      <p className="text-xs text-gray-400">Service fee: {formatRupiah(product.service_fee_idr)}</p>
                    )}
                    {product.shipping_fee_idr > 0 && (
                      <p className="text-xs text-gray-400">Ongkir: {formatRupiah(product.shipping_fee_idr)}</p>
                    )}
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatRupiah(product.total_price_idr)}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 px-4 pb-4">
                <button
                  onClick={() => {
                    setEditProduct(product)
                    setEditForm({
                      product_name: product.product_name,
                      description: product.description ?? '',
                      product_price_idr: product.product_price_idr.toString(),
                      service_fee_idr: product.service_fee_idr.toString(),
                      shipping_fee_idr: product.shipping_fee_idr.toString(),
                      stock: product.stock.toString(),
                    })
                  }}
                  disabled={actionLoading === product.id}
                  className="flex-1 border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg py-1.5 text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-950 disabled:opacity-50 transition-all"
                >
                  Edit
                </button>
                {!product.has_orders && (
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    disabled={actionLoading === product.id}
                    className="border border-red-200 dark:border-red-800 text-red-500 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50 transition-all"
                  >
                    {actionLoading === product.id ? '...' : 'Hapus'}
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