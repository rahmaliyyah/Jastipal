'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'

type Product = {
  id: string
  product_name: string
  product_price_idr: number
  total_price_idr: number
  status: string
  image_url: string | null
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default function AddProductPage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const tripId = params.id as string
  const imageRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')
  const [tripTitle, setTripTitle] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    product_name: '',
    description: '',
    product_price_idr: '',
    service_fee_idr: '',
    shipping_fee_idr: '',
    stock: '1',
  })

  const productPrice = parseFloat(form.product_price_idr) || 0
  const serviceFee = parseFloat(form.service_fee_idr) || 0
  const shippingFee = parseFloat(form.shipping_fee_idr) || 0
  const totalPrice = productPrice + serviceFee + shippingFee

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: tripData } = await supabase
        .from('trips')
        .select('title')
        .eq('id', tripId)
        .eq('jastiper_id', user.id)
        .single()

      if (!tripData) { router.push('/trips'); return }
      setTripTitle(tripData.title)

      fetchProducts(user.id)
    }
    init()
  }, [])

  async function fetchProducts(uid: string) {
    const { data } = await supabase
      .from('listings')
      .select('id, product_name, product_price_idr, total_price_idr, status, image_url')
      .eq('trip_id', tripId)
      .eq('jastiper_id', uid)
      .order('created_at', { ascending: false })
    setProducts(data ?? [])
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleAddProduct() {
    if (!form.product_name.trim()) { setError('Nama produk wajib diisi'); return }
    if (!form.product_price_idr) { setError('Harga produk wajib diisi'); return }

    setLoading(true)
    setError('')

    let imageUrl = null

    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `listings/${userId}/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('listing-images')
        .upload(path, imageFile, { upsert: true })

      if (uploadErr) {
        setError('Gagal upload foto: ' + uploadErr.message)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('listing-images').getPublicUrl(path)
      imageUrl = urlData.publicUrl
    }

    const { error: insertError } = await supabase.from('listings').insert({
      trip_id: tripId,
      jastiper_id: userId,
      product_name: form.product_name,
      description: form.description || null,
      image_url: imageUrl,
      product_price_idr: productPrice,
      service_fee_idr: serviceFee,
      shipping_fee_idr: shippingFee,
      total_price_idr: totalPrice,
      stock: parseInt(form.stock) || 1,
      status: 'open',
    })

    if (insertError) {
      setError('Gagal menambah produk: ' + insertError.message)
      setLoading(false)
      return
    }

    setSuccess('Produk berhasil ditambahkan!')
    setForm({ product_name: '', description: '', product_price_idr: '', service_fee_idr: '', shipping_fee_idr: '', stock: '1' })
    setImageFile(null)
    setImagePreview(null)
    setLoading(false)
    fetchProducts(userId)
    setTimeout(() => setSuccess(''), 3000)
  }

  async function handleDeleteProduct(id: string) {
    await supabase.from('listings').delete().eq('id', id)
    fetchProducts(userId)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <button onClick={() => router.push('/trips')} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 flex items-center gap-1 transition-all">
          ← Ke daftar trip
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tambah Produk</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tripTitle}</p>
      </div>

      {/* Produk yang sudah ditambah */}
      {products.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Produk dalam trip ({products.length})
          </h2>
          <div className="space-y-3">
            {products.map(p => (
              <div key={p.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-3">
                {p.image_url ? (
                  <img src={p.image_url} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.product_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatRupiah(p.total_price_idr)}</p>
                </div>
                <button
                  onClick={() => handleDeleteProduct(p.id)}
                  className="text-red-400 hover:text-red-600 transition-all shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {success && (
        <div className="mb-5 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-5">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Form tambah produk */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Tambah Produk Baru</h2>

        {/* Foto produk */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Foto produk <span className="text-gray-400 text-xs font-normal">(opsional)</span>
          </label>
          <div onClick={() => imageRef.current?.click()} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden cursor-pointer hover:border-gray-400 transition-all">
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} className="w-full h-36 object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                  <p className="text-white text-sm font-medium">Ganti foto</p>
                </div>
              </div>
            ) : (
              <div className="h-28 flex flex-col items-center justify-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                <p className="text-sm text-gray-400">Klik untuk upload foto produk</p>
              </div>
            )}
          </div>
          <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Nama produk <span className="text-red-400">*</span>
          </label>
          <input
            placeholder="Contoh: Nintendo Switch OLED"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={form.product_name}
            onChange={e => setForm({ ...form, product_name: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Deskripsi <span className="text-gray-400 text-xs font-normal">(opsional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="Contoh: Warna putih, ukuran M, original store..."
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Stok <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              placeholder="1"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={form.stock}
              onChange={e => setForm({ ...form, stock: e.target.value })}
            />
          </div>
        </div>

        {/* Harga */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'product_price_idr', label: 'Harga produk', required: true },
            { key: 'service_fee_idr', label: 'Service fee', required: false },
            { key: 'shipping_fee_idr', label: 'Ongkir', required: false },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                {f.label} {f.required && <span className="text-red-400">*</span>}
              </label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rp</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg pl-7 pr-2 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={(form as any)[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Total preview */}
        {totalPrice > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="flex justify-between text-sm font-semibold text-gray-900 dark:text-white">
              <span>Total listing</span>
              <span>{formatRupiah(totalPrice)}</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Buyer bayar {formatRupiah(totalPrice + Math.round(totalPrice * 0.05))} (+ 5% platform fee)</p>
          </div>
        )}

        <button
          onClick={handleAddProduct}
          disabled={loading}
          className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading ? 'Menambahkan...' : '+ Tambah Produk'}
        </button>
      </div>

      {/* Selesai */}
      {products.length > 0 && (
        <button
          onClick={() => router.push('/trips')}
          className="w-full mt-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
        >
          Selesai, lihat trip saya →
        </button>
      )}
    </div>
  )
}