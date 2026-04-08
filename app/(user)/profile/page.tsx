'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type JastiperProfile = {
  kyc_status: 'pending' | 'approved' | 'rejected'
  kyc_rejection_reason: string | null
  bio: string | null
  service_fee_pct: number | null
  base_country: string | null
  whatsapp_number: string | null
}

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [initials, setInitials] = useState('')
  const [jastiperProfile, setJastiperProfile] = useState<JastiperProfile | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '' })

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('users')
        .select('full_name, phone, avatar_url')
        .eq('id', user.id)
        .single()

      if (data) {
        setForm({ full_name: data.full_name ?? '', phone: data.phone ?? '' })
        setAvatarUrl(data.avatar_url)
        const names = (data.full_name ?? '').split(' ')
        setInitials(names.length >= 2 ? names[0][0] + names[1][0] : names[0]?.[0] ?? '?')
      }

      const { data: jpData } = await supabase
        .from('jastiper_profiles')
        .select('kyc_status, kyc_rejection_reason, bio, service_fee_pct, base_country, whatsapp_number')
        .eq('user_id', user.id)
        .single()

      if (jpData) setJastiperProfile(jpData)
      setProfileLoaded(true)
    }
    getProfile()
  }, [])

  async function handleUploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/avatar.${fileExt}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true })
    if (uploadError) { setError('Gagal upload foto'); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
    await supabase.from('users').update({ avatar_url: urlData.publicUrl }).eq('id', userId)
    setAvatarUrl(urlData.publicUrl)
    setUploading(false)
  }

  async function handleSave() {
    setLoading(true)
    setError('')
    setSuccess(false)
    const { error: updateError } = await supabase
      .from('users')
      .update({ full_name: form.full_name, phone: form.phone })
      .eq('id', userId)
    if (updateError) { setError('Gagal menyimpan, coba lagi.'); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
  }

  function renderJastiperSection() {
    if (!profileLoaded) return null

    if (!jastiperProfile) {
      return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Daftar sebagai Jastiper</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Jadilah jastiper dan bantu buyer belanja dari luar negeri. Upload KYC untuk memulai.
          </p>
          <button
            onClick={() => router.push('/profile/switch-to-jastiper')}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all"
          >
            Daftar sebagai Jastiper
          </button>
        </div>
      )
    }

    if (jastiperProfile.kyc_status === 'pending') {
      return (
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
            <h2 className="text-base font-semibold text-yellow-800 dark:text-yellow-300">Menunggu Review Admin</h2>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            Pengajuan jastiper kamu sedang diproses. Kami akan memberitahu kamu setelah review selesai.
          </p>
        </div>
      )
    }

    if (jastiperProfile.kyc_status === 'rejected') {
      return (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-400"></div>
            <h2 className="text-base font-semibold text-red-800 dark:text-red-300">Pengajuan Ditolak</h2>
          </div>
          {jastiperProfile.kyc_rejection_reason && (
            <p className="text-sm text-red-700 dark:text-red-400 mb-4">
              Alasan: {jastiperProfile.kyc_rejection_reason}
            </p>
          )}
          <button
            onClick={() => router.push('/profile/switch-to-jastiper')}
            className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all"
          >
            Ajukan Ulang
          </button>
        </div>
      )
    }

    return (
      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          <h2 className="text-base font-semibold text-green-800 dark:text-green-300">Verified Jastiper ✓</h2>
        </div>
        <div className="text-sm text-green-700 dark:text-green-400 space-y-1">
          <p>Kamu sudah terdaftar sebagai jastiper.</p>
          {jastiperProfile.base_country && <p>Domisili: {jastiperProfile.base_country}</p>}
          {jastiperProfile.service_fee_pct && <p>Service fee: {jastiperProfile.service_fee_pct}%</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Profil saya</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola informasi akun kamu</p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Data Pribadi</h2>

        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-lg font-medium text-blue-600 dark:text-blue-300 uppercase">
              {initials}
            </div>
          )}
          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-sm font-medium text-blue-500 hover:text-blue-600 disabled:opacity-50 transition-all"
            >
              {uploading ? 'Mengupload...' : 'Ganti foto'}
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">JPG atau PNG, maks 2MB</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadAvatar} />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3 mb-4">
            <p className="text-green-600 dark:text-green-400 text-sm">Profil berhasil disimpan!</p>
          </div>
        )}

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Nama lengkap</label>
          <input
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={form.full_name}
            onChange={e => setForm({ ...form, full_name: e.target.value })}
          />
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Nomor telepon</label>
          <input
            type="tel"
            placeholder="08xxxxxxxxxx"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading ? 'Menyimpan...' : 'Simpan perubahan'}
        </button>
      </div>

      {renderJastiperSection()}
    </div>
  )
}