'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

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
      <div className="w-6 h-6 border-2 border-[#CBD5E1] border-t-[#49BC9E] rounded-full animate-spin"></div>
    </div>
  )

  if (!trip) return null

  const expired = isTripExpired(trip.arrival_date)
  const openCount = products.filter(p => p.stock > 0).length
  const soldOutCount = products.filter(p => p.stock === 0).length

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto px-3 sm:px-6 py-4 sm:py-2">

        {/* Edit modal */}
        {editProduct && (
          <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-2xl border border-[#CBD5E1] w-full max-w-md shadow-2xl max-h-[90vh] sm:max-h-none overflow-y-auto sm:overflow-visible">
              <div className="p-4 sm:p-5 border-b border-[#F1F5F9] flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-[16px] sm:text-[18px] font-bold text-[#0F172A]">Edit Produk</h2>
                <button onClick={() => setEditProduct(null)} className="text-[#94A3B8] hover:text-[#64748B] transition-colors flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                <div>
                  <label className="text-[12px] sm:text-[13px] font-medium text-[#1E293B] mb-1.5 block">Nama produk</label>
                  <input
                    className="w-full border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#49BC9E] bg-white text-[#1E293B] transition-colors"
                    value={editForm.product_name}
                    onChange={e => setEditForm({ ...editForm, product_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[12px] sm:text-[13px] font-medium text-[#1E293B] mb-1.5 block">Deskripsi</label>
                  <textarea
                    rows={2}
                    placeholder="Warna, ukuran, varian..."
                    className="w-full border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#49BC9E] bg-white text-[#1E293B] resize-none transition-colors"
                    value={editForm.description}
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {[
                    { key: 'product_price_idr', label: 'Harga produk' },
                    { key: 'service_fee_idr', label: 'Service fee' },
                    { key: 'shipping_fee_idr', label: 'Ongkir' },
                    { key: 'stock', label: 'Stok' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-[12px] sm:text-[13px] font-medium text-[#1E293B] mb-1.5 block">{f.label}</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#49BC9E] bg-white text-[#1E293B] transition-colors"
                        value={(editForm as any)[f.key]}
                        onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-3">
                  <div className="flex justify-between text-[14px] sm:text-[15px] font-semibold text-[#0F172A]">
                    <span>Total listing</span>
                    <span>{formatRupiah((parseFloat(editForm.product_price_idr) || 0) + (parseFloat(editForm.service_fee_idr) || 0) + (parseFloat(editForm.shipping_fee_idr) || 0))}</span>
                  </div>
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => setEditProduct(null)}
                    className="flex-1 h-[44px] border border-[#CBD5E1] text-[#64748B] rounded-xl text-[13px] sm:text-[15px] font-semibold hover:bg-[#F8FAFC] transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={editLoading}
                    className="flex-1 h-[44px] bg-[#49BC9E] hover:bg-[#3dab8e] text-white rounded-xl text-[13px] sm:text-[15px] font-semibold disabled:opacity-50 transition-all"
                  >
                    {editLoading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BACK */}
        <button
          onClick={() => router.push('/trips')}
          className="flex items-center gap-1 text-[#64748B] text-[13px] sm:text-[15px] hover:text-[#0F172A] transition-colors mb-3 sm:mb-4"
        >
          <ChevronLeft size={18} />
          Kembali
        </button>

        {/* TRIP CARD */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl overflow-hidden mb-6 sm:mb-8">

          {/* COVER */}
          <div className="h-[160px] sm:h-[280px] w-full bg-[#CBD5E1] overflow-hidden">
            {trip.image_url && (
              <img
                src={trip.image_url}
                alt={trip.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, #49BC9E 0%, #2563EB 100%)'
                }}
              />
            )}
          </div>

          {/* INFO */}
          <div className="p-4 sm:p-6">
            <h1 className="text-[18px] sm:text-[24px] font-bold text-[#0F172A] mb-3 sm:mb-4 break-words">{trip.title}</h1>

            {/* INFO GRID */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-[#F8FAFC] rounded-xl p-2 sm:p-3">
                <p className="text-[10px] sm:text-[12px] text-[#94A3B8] mb-1">Negara</p>
                <p className="text-[13px] sm:text-[15px] font-semibold text-[#0F172A] break-words">{trip.trip_country}</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl p-2 sm:p-3">
                <p className="text-[10px] sm:text-[12px] text-[#94A3B8] mb-1">Tanggal Tiba</p>
                <p className="text-[13px] sm:text-[15px] font-semibold text-[#0F172A]">{formatDate(trip.arrival_date)}</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl p-2 sm:p-3">
                <p className="text-[10px] sm:text-[12px] text-[#94A3B8] mb-1">Produk</p>
                <p className="text-[13px] sm:text-[15px] font-semibold text-[#0F172A]">{openCount} ada · {soldOutCount} habis</p>
              </div>
            </div>

            {/* DESCRIPTION */}
            {trip.description && (
              <div className="bg-[#F8FAFC] rounded-xl p-2 sm:p-3">
                <p className="text-[10px] sm:text-[12px] text-[#94A3B8] mb-1">Deskripsi</p>
                <p className="text-[12px] sm:text-[14px] text-[#1E293B] line-clamp-2 sm:line-clamp-none">{trip.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Success toast */}
        {success && (
          <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 rounded-xl px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
            <p className="text-[12px] sm:text-[14px] text-green-700 font-medium break-words">{success}</p>
            <button onClick={() => setSuccess('')} className="text-green-400 ml-2 flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}

        {/* KATALOG PRODUK */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-[18px] sm:text-[20px] font-bold text-[#0F172A]">Katalog Produk</h2>
          {!expired && (
            <button
              onClick={() => router.push(`/trips/${tripId}/products/new`)}
              className="text-[12px] sm:text-[14px] font-semibold text-[#49BC9E] hover:text-[#3dab8e] transition-colors whitespace-nowrap"
            >
              + Tambah Produk
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-12 flex flex-col items-center gap-3">
            <p className="text-[13px] sm:text-[15px] text-[#94A3B8] text-center">Belum ada produk di trip ini.</p>
            {!expired && (
              <button
                onClick={() => router.push(`/trips/${tripId}/products/new`)}
                className="mt-2 h-[44px] px-6 rounded-xl bg-[#49BC9E] hover:bg-[#3dab8e] text-white font-semibold text-[13px] sm:text-[15px] transition-all"
              >
                Tambah Produk Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {products.map(product => (
              <div
                key={product.id}
                className="bg-white border border-[#CBD5E1] rounded-2xl overflow-hidden"
              >
                <div className="p-3 sm:p-5">
                  {/* PRODUCT TOP */}
                  <div className="flex gap-3 sm:gap-4">
                    {/* IMAGE */}
                    <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] rounded-xl bg-[#F1F5F9] flex-shrink-0 overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#94A3B8]">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* INFO */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-[13px] sm:text-[15px] font-bold text-[#0F172A] leading-snug break-words">
                          {product.product_name}
                        </h3>
                        <span className={`flex-shrink-0 text-[10px] sm:text-[12px] font-semibold px-2 sm:px-3 py-1 rounded-full whitespace-nowrap ${
                          product.stock === 0
                            ? 'bg-red-50 text-red-500 border border-red-200'
                            : 'bg-[#ECFDF5] text-[#059669]'
                        }`}>
                          {product.stock === 0 ? 'Stok Habis' : `Stok: ${product.stock}`}
                        </span>
                      </div>

                      {product.description && (
                        <ul className="mt-2 space-y-1">
                          {product.description.split('\n').slice(0, 2).map((line, i) => (
                            <li key={i} className="text-[11px] sm:text-[13px] text-[#64748B] flex gap-2">
                              <span className="mt-[4px] sm:mt-[6px] w-1.5 h-1.5 rounded-full bg-[#94A3B8] flex-shrink-0" />
                              <span className="line-clamp-1">{line}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* PRICE GRID */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-3 sm:mt-4">
                    <div className="bg-[#F8FAFC] rounded-xl p-2 sm:p-3">
                      <p className="text-[10px] sm:text-[12px] text-[#94A3B8] mb-1">Harga Produk</p>
                      <p className="text-[12px] sm:text-[14px] font-semibold text-[#0F172A]">{formatRupiah(product.product_price_idr)}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-xl p-2 sm:p-3">
                      <p className="text-[10px] sm:text-[12px] text-[#94A3B8] mb-1">Service Fee</p>
                      <p className="text-[12px] sm:text-[14px] font-semibold text-[#0F172A]">{formatRupiah(product.service_fee_idr)}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-xl p-2 sm:p-3">
                      <p className="text-[10px] sm:text-[12px] text-[#94A3B8] mb-1">Ongkos Kirim</p>
                      <p className="text-[12px] sm:text-[14px] font-semibold text-[#0F172A]">{formatRupiah(product.shipping_fee_idr)}</p>
                    </div>
                  </div>

                  {/* PRODUCT ACTIONS — dinamis 1 atau 2 kolom */}
                  <div className={`grid gap-2 sm:gap-3 mt-3 sm:mt-4 ${!product.has_orders ? 'grid-cols-2' : 'grid-cols-1'}`}>
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
                      className="w-full h-[40px] sm:h-[48px] rounded-xl bg-[#49BC9E] hover:bg-[#3dab8e] text-white font-semibold text-[12px] sm:text-[15px] disabled:opacity-50 transition-all"
                    >
                      Edit
                    </button>

                    {!product.has_orders && (
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={actionLoading === product.id}
                        className="w-full h-[40px] sm:h-[48px] rounded-xl border border-[#CBD5E1] hover:bg-[#FEF2F2] hover:border-[#FECACA] text-[#64748B] hover:text-[#DC2626] font-semibold text-[12px] sm:text-[15px] disabled:opacity-50 transition-all"
                      >
                        {actionLoading === product.id ? '...' : 'Hapus'}
                      </button>
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