'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { ChevronLeft, ImagePlus } from 'lucide-react'

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

function formatRupiahInput(val: string) {
  const num = val.replace(/\D/g, '')
  return num ? parseInt(num).toLocaleString('id-ID') : ''
}

function parseRupiahInput(val: string) {
  return parseFloat(val.replace(/\./g, '').replace(/,/g, '')) || 0
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

  const productPrice = parseRupiahInput(form.product_price_idr)
  const serviceFee = parseRupiahInput(form.service_fee_idr)
  const shippingFee = parseRupiahInput(form.shipping_fee_idr)
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

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
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

  const showTotal = form.product_price_idr || form.service_fee_idr || form.shipping_fee_idr

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-2 sm:py-2">

        {/* BACK */}
        <button
          onClick={() => router.push('/trips')}
          className="flex items-center gap-1 text-[#64748B] text-[15px] hover:text-[#0F172A] transition-colors mb-4"
        >
          <ChevronLeft size={18} />
          Kembali
        </button>

        {/* HEADER */}
        <h1 className="text-[28px] font-bold text-[#0F172A]">Tambah Produk</h1>
        <p className="mt-1 text-[14px] text-[#94A3B8] mb-6">{tripTitle}</p>

        {/* Produk yang sudah ditambah */}
        {products.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[16px] font-bold text-[#0F172A] mb-3">
              Produk dalam Trip
              <span className="ml-2 text-[14px] font-normal text-[#94A3B8]">({products.length} item)</span>
            </h2>
            <div className="space-y-3">
              {products.map(p => (
                <div key={p.id} className="bg-white border border-[#CBD5E1] rounded-2xl p-4 flex items-center gap-4">
                  {p.image_url ? (
                    <img src={p.image_url} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#F1F5F9] flex items-center justify-center shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#94A3B8]">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-[#0F172A] truncate">{p.product_name}</p>
                    <p className="text-[13px] text-[#64748B] mt-0.5">{formatRupiah(p.total_price_idr)}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="text-[#94A3B8] hover:text-red-500 transition-colors shrink-0"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success toast */}
        {success && (
          <div className="mb-5 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <p className="text-[14px] text-green-700 font-medium">{success}</p>
            <button onClick={() => setSuccess('')} className="text-green-400 ml-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* FORM CARD */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-8">
          <h2 className="text-[20px] font-bold text-[#0F172A] mb-6">Detail Produk</h2>

          {/* FOTO */}
          <div className="mb-6">
            <p className="text-[14px] font-medium text-[#1E293B] mb-2">
              Foto Produk <span className="italic font-normal text-[#94A3B8]">(opsional)</span>
            </p>

            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full max-h-[300px] object-cover" />
                <button
                  onClick={() => { setImagePreview(null); setImageFile(null) }}
                  className="absolute top-3 right-3 bg-white/80 hover:bg-white text-[#DC2626] text-[13px] font-semibold px-3 py-1 rounded-lg transition-all"
                >
                  Ganti
                </button>
              </div>
            ) : (
              <div
                onClick={() => imageRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="w-full h-[160px] border-2 border-dashed border-[#CBD5E1] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#49BC9E] transition-colors"
              >
                <ImagePlus size={28} className="text-[#94A3B8]" />
                <p className="text-[14px]">
                  <span className="text-[#49BC9E] font-medium">Upload a file</span>
                  <span className="text-[#64748B]"> or drag and drop</span>
                </p>
                <p className="text-[12px] text-[#94A3B8]">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}

            <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          {/* NAMA PRODUK */}
          <div className="mb-5">
            <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
              Nama Produk <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.product_name}
              onChange={e => setForm({ ...form, product_name: e.target.value })}
              placeholder="Contoh: Nintendo Switch OLED"
              className="w-full h-[48px] px-4 rounded-xl border border-[#E2E8F0] text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#49BC9E] transition-colors"
            />
          </div>

          {/* DESKRIPSI */}
          <div className="mb-5">
            <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
              Deskripsi <span className="italic font-normal text-[#94A3B8]">(Opsional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Jelaskan detail produk, termasuk ukuran, warna, varian, atau catatan khusus."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] resize-none outline-none focus:border-[#49BC9E] transition-colors"
            />
          </div>

          {/* HARGA + JUMLAH */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
                Harga Produk <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center h-[48px] border border-[#E2E8F0] rounded-xl px-4 gap-2 focus-within:border-[#49BC9E] transition-colors">
                <span className="text-[14px] text-[#94A3B8] font-medium shrink-0">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.product_price_idr}
                  onChange={e => setForm({ ...form, product_price_idr: formatRupiahInput(e.target.value) })}
                  placeholder="Masukkan harga produk"
                  className="flex-1 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
                Jumlah <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center h-[48px] border border-[#E2E8F0] rounded-xl overflow-hidden">
                <button
                  onClick={() => setForm({ ...form, stock: String(Math.max(1, parseInt(form.stock) - 1)) })}
                  className="w-12 h-full flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] text-[20px] font-bold transition-colors border-r border-[#E2E8F0]"
                >
                  −
                </button>
                <span className="flex-1 text-center text-[15px] font-semibold text-[#0F172A]">
                  {form.stock}
                </span>
                <button
                  onClick={() => setForm({ ...form, stock: String(parseInt(form.stock) + 1) })}
                  className="w-12 h-full flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] text-[20px] font-bold transition-colors border-l border-[#E2E8F0]"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* SERVICE FEE + ONGKIR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-[14px] font-medium text-[#1E293B] mb-2">Service Fee</label>
              <div className="flex items-center h-[48px] border border-[#E2E8F0] rounded-xl px-4 gap-2 focus-within:border-[#49BC9E] transition-colors">
                <span className="text-[14px] text-[#94A3B8] font-medium shrink-0">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.service_fee_idr}
                  onChange={e => setForm({ ...form, service_fee_idr: formatRupiahInput(e.target.value) })}
                  placeholder="Masukkan service fee"
                  className="flex-1 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1E293B] mb-2">Ongkos Kirim</label>
              <div className="flex items-center h-[48px] border border-[#E2E8F0] rounded-xl px-4 gap-2 focus-within:border-[#49BC9E] transition-colors">
                <span className="text-[14px] text-[#94A3B8] font-medium shrink-0">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.shipping_fee_idr}
                  onChange={e => setForm({ ...form, shipping_fee_idr: formatRupiahInput(e.target.value) })}
                  placeholder="Masukkan ongkos kirim"
                  className="flex-1 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* TOTAL LISTING */}
          {showTotal && (
            <div className="bg-[#F0FDF9] border border-[#A7F3D0] rounded-xl p-4 mb-6">
              <p className="text-[13px] text-[#059669] font-medium mb-1">Total Harga</p>
              <p className="text-[18px] font-bold text-[#0F172A]">
                Rp {totalPrice.toLocaleString('id-ID')}
              </p>
              <p className="text-[12px] text-[#64748B] mt-1">
                Buyer bayar {formatRupiah(totalPrice + Math.round(totalPrice * 0.05))} (+ 5% platform fee)
              </p>
            </div>
          )}

        </div>

        {/* ACTIONS */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-between">
          {products.length > 0 && (
            <button
              onClick={() => router.push('/trips')}
              className="h-[52px] px-8 rounded-xl border border-[#CBD5E1] text-[#64748B] hover:bg-[#F8FAFC] font-semibold text-[16px] transition-all"
            >
              Selesai, lihat trip saya →
            </button>
          )}
          <button
            onClick={handleAddProduct}
            disabled={loading}
            className="h-[52px] px-8 rounded-xl bg-[#49BC9E] hover:bg-[#3da88d] text-white font-semibold text-[16px] disabled:opacity-50 transition-all shadow-lg shadow-teal-100 sm:ml-auto"
          >
            {loading ? 'Menambahkan...' : '+ Tambah Produk'}
          </button>
        </div>

      </div>
    </main>
  )
}