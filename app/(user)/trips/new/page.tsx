'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

    setLoading(true)
    setError('')

    let imageUrl = null

    // upload foto trip
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

    // redirect ke halaman tambah produk
    router.push(`/trips/${tripData.id}/products/new`)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 flex items-center gap-1 transition-all">
          ← Kembali
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Buat Trip</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Informasi perjalanan kamu</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-5">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-5">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">

          {/* Foto trip */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Foto trip <span className="text-gray-400 text-xs font-normal">(opsional)</span>
            </label>
            <div
              onClick={() => imageRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden cursor-pointer hover:border-gray-400 transition-all"
            >
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                    <p className="text-white text-sm font-medium">Ganti foto</p>
                  </div>
                </div>
              ) : (
                <div className="h-36 flex flex-col items-center justify-center gap-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p className="text-sm text-gray-400">Klik untuk upload foto trip</p>
                  <p className="text-xs text-gray-400">JPG, PNG — maks 5MB</p>
                </div>
              )}
            </div>
            <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          {/* Judul */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Judul trip <span className="text-red-400">*</span>
            </label>
            <input
              placeholder="Contoh: Tokyo & Osaka, April 2026"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Deskripsi <span className="text-gray-400 text-xs font-normal">(opsional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Ceritakan detail tripmu, bisa titip barang apa, area mana yang dikunjungi, dsb..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Negara & tanggal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Negara tujuan <span className="text-red-400">*</span>
              </label>
              <input
                placeholder="Contoh: Jepang"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={form.trip_country}
                onChange={e => setForm({ ...form, trip_country: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Tanggal tiba di Indonesia <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={form.arrival_date}
                onChange={e => setForm({ ...form, arrival_date: e.target.value })}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl py-3 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading ? 'Membuat trip...' : 'Lanjut → Tambah Produk'}
        </button>
      </div>
    </div>
  )
}