'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
  })

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
        setForm({
          full_name: data.full_name ?? '',
          phone: data.phone ?? '',
        })
        setAvatarUrl(data.avatar_url)
        const names = (data.full_name ?? '').split(' ')
        setInitials(names.length >= 2
          ? names[0][0] + names[1][0]
          : names[0]?.[0] ?? '?'
        )
      }
    }
    getProfile()
  }, [])

  async function handleUploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setUploading(true)

    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/avatar.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setError('Gagal upload foto')
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    await supabase
      .from('users')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', userId)

    setAvatarUrl(urlData.publicUrl)
    setUploading(false)
  }

  async function handleSave() {
    setLoading(true)
    setError('')
    setSuccess(false)

    const { error: updateError } = await supabase
      .from('users')
      .update({
        full_name: form.full_name,
        phone: form.phone,
      })
      .eq('id', userId)

    if (updateError) {
      setError('Gagal menyimpan, coba lagi.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Profil saya</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola informasi akun kamu</p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-lg font-medium text-blue-600 dark:text-blue-300">
                {initials}
              </div>
            )}
          </div>
          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-sm font-medium text-blue-500 hover:text-blue-600 disabled:opacity-50 transition-all"
            >
              {uploading ? 'Mengupload...' : 'Ganti foto'}
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">JPG atau PNG, maks 2MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadAvatar}
            />
          </div>
        </div>

        {/* Form */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4">Profil berhasil disimpan!</p>}

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Nama lengkap
          </label>
          <input
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={form.full_name}
            onChange={e => setForm({ ...form, full_name: e.target.value })}
          />
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Nomor telepon
          </label>
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
    </div>
  )
}