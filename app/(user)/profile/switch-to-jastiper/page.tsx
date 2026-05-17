'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SwitchToJastiperPage() {
  const supabase = createClient()
  const router = useRouter()

  const idcardRef = useRef<HTMLInputElement>(null)
  const selfieRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [idcardFile, setIdcardFile] = useState<File | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    bio: '',
    service_fee_pct: '',
    base_country: '',
    whatsapp_number: '',
  })

  async function uploadFile(file: File, userId: string, type: 'idcard' | 'selfie') {
    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/kyc_${type}.${fileExt}`
    const { error } = await supabase.storage
      .from('kyc-documents')
      .upload(filePath, file, { upsert: true })
    if (error) throw new Error(`Gagal upload ${type}`)
    const { data } = supabase.storage.from('kyc-documents').getPublicUrl(filePath)
    return data.publicUrl
  }

  async function handleSubmit() {
    if (!idcardFile || !selfieFile) {
      setError('Foto KTP dan selfie wajib diupload')
      return
    }
    if (!form.bio || !form.service_fee_pct || !form.base_country || !form.whatsapp_number) {
      setError('Semua field wajib diisi')
      return
    }

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    try {
      const idcardUrl = await uploadFile(idcardFile, user.id, 'idcard')
      const selfieUrl = await uploadFile(selfieFile, user.id, 'selfie')

      const { error: upsertError } = await supabase.from('jastiper_profiles').upsert({
        user_id: user.id,
        bio: form.bio,
        service_fee_pct: parseFloat(form.service_fee_pct),
        base_country: form.base_country,
        whatsapp_number: form.whatsapp_number,
        kyc_idcard_url: idcardUrl,
        kyc_selfie_url: selfieUrl,
        kyc_status: 'pending',
      })

      if (upsertError) throw new Error('Gagal menyimpan data')

      router.push('/profile')
    } catch (err: any) {
      setError(err.message ?? 'Terjadi kesalahan, coba lagi.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Profile
      </button>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Daftar sebagai Jastiper</h1>
        <p className="text-sm text-gray-500">Isi data di bawah ini dan upload dokumen identitas untuk verifikasi</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-5">Data Pribadi</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Bio */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Bio <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Ceritakan sedikit tentang dirimu sebagai jastiper..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#49BC9E] transition-colors resize-none"
            value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
          />
        </div>

        {/* Service Fee */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Service Fee (%) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="Masukkan biaya service Anda"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#49BC9E] transition-colors"
            value={form.service_fee_pct}
            onChange={e => setForm({ ...form, service_fee_pct: e.target.value })}
          />
        </div>

        {/* Negara Domisili */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Alamat di Indonesia <span className="text-red-400">*</span>
          </label>
          <input
            placeholder="Masukkan alamat Anda di Indonesia. Contoh: Jl. Merdeka, Jakarta"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#49BC9E] transition-colors"
            value={form.base_country}
            onChange={e => setForm({ ...form, base_country: e.target.value })}
          />
        </div>

        {/* WhatsApp */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nomor WhatsApp <span className="text-red-400">*</span>
          </label>
          <input
            type="tel"
            placeholder="+6281234567890"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#49BC9E] transition-colors"
            value={form.whatsapp_number}
            onChange={e => setForm({ ...form, whatsapp_number: e.target.value })}
          />
          <p className="text-xs text-gray-400 mt-1">Nomor ini akan ditampilkan ke buyer untuk komunikasi</p>
        </div>

        {/* Foto KTP / Passport Opsional */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Foto KTP / Passport <span className="text-red-400">*</span>
          </label>
          <div
            onClick={() => idcardRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg px-6 py-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#49BC9E] transition-colors"
          >
            {idcardFile ? (
              <p className="text-sm text-green-600 font-medium">✓ {idcardFile.name}</p>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-center">
                  <span className="text-[#49BC9E] font-medium hover:underline">Upload a file</span>
                  <span className="text-gray-500"> or drag and drop</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
              </>
            )}
          </div>
          <input
            ref={idcardRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => setIdcardFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Foto Selfie + KTP */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Foto Selfie & KTP <span className="text-red-400">*</span>
          </label>
          <div
            onClick={() => selfieRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg px-6 py-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#49BC9E] transition-colors"
          >
            {selfieFile ? (
              <p className="text-sm text-green-600 font-medium">✓ {selfieFile.name}</p>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-center">
                  <span className="text-[#49BC9E] font-medium hover:underline">Upload a file</span>
                  <span className="text-gray-500"> or drag and drop</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
              </>
            )}
          </div>
          <input
            ref={selfieRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => setSelfieFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#49BC9E] hover:bg-[#3da88d] transition-colors text-white font-semibold text-sm py-3 rounded-lg disabled:opacity-50 mb-3"
        >
          {loading ? 'Mengirim pengajuan...' : 'Kirim Pengajuan'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Jastipal menjamin keamanan data Anda. Informasi yang diberikan hanya digunakan untuk proses verifikasi identitas
        </p>
      </div>
    </div>
  )
}