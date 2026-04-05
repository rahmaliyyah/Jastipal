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
    <div className="max-w-lg">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 flex items-center gap-1 transition-all"
        >
          ← Kembali
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Daftar sebagai Jastiper</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Isi data di bawah dan upload dokumen identitas untuk diverifikasi admin.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-5">

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Bio <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Ceritakan sedikit tentang dirimu sebagai jastiper..."
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Service fee (%) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="Contoh: 10 (artinya 10%)"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={form.service_fee_pct}
            onChange={e => setForm({ ...form, service_fee_pct: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Negara domisili <span className="text-red-400">*</span>
          </label>
          <input
            placeholder="Contoh: Japan"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={form.base_country}
            onChange={e => setForm({ ...form, base_country: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Nomor WhatsApp <span className="text-red-400">*</span>
          </label>
          <input
            type="tel"
            placeholder="+6281234567890"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={form.whatsapp_number}
            onChange={e => setForm({ ...form, whatsapp_number: e.target.value })}
          />
          <p className="text-xs text-gray-400 mt-1">Nomor ini akan ditampilkan ke buyer untuk komunikasi</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Foto KTP / Passport <span className="text-red-400">*</span>
          </label>
          <div
            onClick={() => idcardRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-all"
          >
            {idcardFile ? (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">✓ {idcardFile.name}</p>
            ) : (
              <p className="text-sm text-gray-400">Klik untuk upload foto KTP atau passport</p>
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

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Foto Selfie + KTP <span className="text-red-400">*</span>
          </label>
          <div
            onClick={() => selfieRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-all"
          >
            {selfieFile ? (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">✓ {selfieFile.name}</p>
            ) : (
              <p className="text-sm text-gray-400">Klik untuk upload foto selfie sambil pegang KTP</p>
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

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading ? 'Mengirim pengajuan...' : 'Kirim Pengajuan'}
        </button>

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          Data kamu aman dan hanya digunakan untuk verifikasi identitas
        </p>
      </div>
    </div>
  )
}