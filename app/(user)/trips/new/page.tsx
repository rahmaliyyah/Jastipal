'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ImagePlus, Calendar } from 'lucide-react'

export default function NewTripPage() {
  const supabase = createClient()
  const router = useRouter()
  const imageRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    trip_country: '',
    arrival_date: '',
    arrival_city: '',
  })

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

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit() {
    if (!form.title.trim()) { setError('Judul trip wajib diisi'); return }
    if (!form.trip_country.trim()) { setError('Negara tujuan wajib diisi'); return }
    if (!form.arrival_date) { setError('Tanggal tiba wajib diisi'); return }
    if (!form.arrival_city.trim()) { setError('Kota tiba wajib diisi'); return }

    setLoading(true)
    setError('')

    let imageUrl = null

    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `trips/${userId}/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('trip-images')
        .upload(path, imageFile, { upsert: true })

      if (uploadErr) {
        setError('Gagal upload foto: ' + uploadErr.message)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('trip-images').getPublicUrl(path)
      imageUrl = urlData.publicUrl
    }

    const { data: tripData, error: insertError } = await supabase
      .from('trips')
      .insert({
        jastiper_id: userId,
        title: form.title,
        description: form.description || null,
        trip_country: form.trip_country,
        arrival_date: form.arrival_date,
        arrival_city: form.arrival_city || null,
        image_url: imageUrl,
        status: 'open',
      })
      .select('id')
      .single()

    if (insertError) {
      setError('Gagal membuat trip: ' + insertError.message)
      setLoading(false)
      return
    }

    router.push(`/trips/${tripData.id}/products/new`)
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 sm:py-2">

        {/* BACK */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-[#64748B] text-[15px] hover:text-[#0F172A] transition-colors mb-4"
        >
          <ChevronLeft size={18} />
          Kembali
        </button>

        {/* HEADER */}
        <h1 className="text-[28px] font-bold text-[#0F172A]">Buat Perjalanan</h1>
        <p className="mt-1 text-[14px] text-[#94A3B8] mb-6">Informasi perjalanan Anda</p>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* FORM CARD */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-8">
          <h2 className="text-[20px] font-bold text-[#0F172A] mb-6">Detail Perjalanan</h2>

          {/* FOTO */}
          <div className="mb-6">
            <p className="text-[14px] font-medium text-[#1E293B] mb-2">
              Foto Perjalanan <span className="italic font-normal text-[#94A3B8]">(opsional)</span>
            </p>

            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-[280px] object-cover"
                />
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

            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* JUDUL */}
          <div className="mb-5">
            <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
              Judul Perjalanan <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Contoh: Tokyo & Osaka, April 2026"
              className="w-full h-[48px] px-4 rounded-xl border border-[#E2E8F0] text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#49BC9E] transition-colors"
            />
          </div>

          {/* NEGARA + TANGGAL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
                Negara Tujuan <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.trip_country}
                onChange={e => setForm({ ...form, trip_country: e.target.value })}
                placeholder="Contoh: Jepang"
                className="w-full h-[48px] px-4 rounded-xl border border-[#E2E8F0] text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#49BC9E] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
                Tanggal Tiba di Indonesia <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="date"
                  value={form.arrival_date}
                  onChange={e => setForm({ ...form, arrival_date: e.target.value })}
                  className="w-full h-[48px] pl-10 pr-4 rounded-xl border border-[#E2E8F0] text-[14px] text-[#0F172A] outline-none focus:border-[#49BC9E] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* DESKRIPSI */}
          <div className="mb-5">
            <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
              Deskripsi <span className="italic font-normal text-[#94A3B8]">(Opsional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Ceritakan detail tripmu, bisa titip barang apa, area mana yang dikunjungi, dsb..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] resize-none outline-none focus:border-[#49BC9E] transition-colors"
            />
          </div>

          {/* KOTA */}
          <div>
            <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
              Kota Kedatangan di Indonesia <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.arrival_city}
              onChange={e => setForm({ ...form, arrival_city: e.target.value })}
              placeholder="Contoh: Malang, Jakarta, Surabaya"
              className="w-full h-[48px] px-4 rounded-xl border border-[#E2E8F0] text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#49BC9E] transition-colors"
            />
            <p className="text-[12px] text-[#94A3B8] mt-1">Kota ini digunakan untuk menghitung ongkir domestik ke buyer</p>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="h-[52px] px-8 rounded-xl bg-[#49BC9E] hover:bg-[#3da88d] text-white font-semibold text-[16px] disabled:opacity-50 transition-all shadow-lg shadow-teal-100"
          >
            {loading ? 'Membuat trip...' : 'Lanjut Tambah Produk'}
          </button>
        </div>

      </div>
    </main>
  )
}