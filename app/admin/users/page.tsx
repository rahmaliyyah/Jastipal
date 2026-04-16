'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  is_jastiper: boolean
  is_frozen: boolean
  is_admin: boolean
  active_role: string
  created_at: string
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminUsersPage() {
  const supabase = createClient()
  const router = useRouter()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<User | null>(null)
  const [reason, setReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [adminId, setAdminId] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setAdminId(user.id)
      fetchUsers()
    }
    init()
  }, [])

  async function fetchUsers(q?: string) {
    setLoading(true)
    const res = await fetch(`/api/admin/users${q?.trim() ? `?q=${encodeURIComponent(q)}` : ''}`)
    const json = await res.json()
    setUsers(json.data ?? [])
    setLoading(false)
  }

  async function handleFreeze(user: User) {
    if (!reason.trim()) return
    setActionLoading(true)

    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_user_id: user.id, action: 'freeze', reason, admin_id: adminId }),
    })

    setSuccess(`Akun ${user.full_name} berhasil dibekukan`)
    setSelected(null)
    setReason('')
    setActionLoading(false)
    fetchUsers(search)
  }

  async function handleUnfreeze(user: User) {
    setActionLoading(true)

    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_user_id: user.id, action: 'unfreeze', reason: 'Diaktifkan kembali oleh admin', admin_id: adminId }),
    })

    setSuccess(`Akun ${user.full_name} berhasil diaktifkan kembali`)
    setSelected(null)
    setReason('')
    setActionLoading(false)
    fetchUsers(search)
  }

  return (
    <div>
      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {selected.is_frozen ? 'Aktifkan Akun' : 'Bekukan Akun'}
              </h2>
              <button onClick={() => { setSelected(null); setReason('') }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* User info */}
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                {selected.avatar_url ? (
                  <img src={selected.avatar_url} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-300 uppercase">
                    {selected.full_name?.[0] ?? '?'}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{selected.full_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selected.email}</p>
                </div>
              </div>

              {selected.is_frozen ? (
                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Akun ini sedang dibekukan. Mengaktifkan kembali akan memungkinkan user untuk login dan menggunakan platform.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-xs text-red-700 dark:text-red-300">
                      Membekukan akun akan mencegah user login. Semua aktivitas sebagai buyer maupun jastiper akan terhenti.
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Alasan pembekuan <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Contoh: Melanggar ketentuan layanan, penipuan, dll"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => { setSelected(null); setReason('') }}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Batal
                </button>
                {selected.is_frozen ? (
                  <button
                    onClick={() => handleUnfreeze(selected)}
                    disabled={actionLoading}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50 transition-all"
                  >
                    {actionLoading ? 'Memproses...' : 'Aktifkan Kembali'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleFreeze(selected)}
                    disabled={actionLoading || !reason.trim()}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50 transition-all"
                  >
                    {actionLoading ? 'Memproses...' : 'Bekukan Akun'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Manajemen User</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola akun user platform Jastipal</p>
      </div>

      {/* Success toast */}
      {success && (
        <div className="mb-5 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
          <button onClick={() => setSuccess('')} className="text-green-500 ml-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Cari nama atau email..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          value={search}
          onChange={e => { setSearch(e.target.value); fetchUsers(e.target.value) }}
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-4">
              {/* Avatar */}
              {user.avatar_url ? (
                <img src={user.avatar_url} className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-300 uppercase shrink-0">
                  {user.full_name?.[0] ?? '?'}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.full_name}</p>
                  {user.is_admin && (
                    <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full font-medium">Admin</span>
                  )}
                  {user.is_jastiper && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full font-medium">Jastiper</span>
                  )}
                  {user.is_frozen && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full font-medium">❄️ Frozen</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">Bergabung {formatDate(user.created_at)}</p>
              </div>

              {/* Action */}
              {!user.is_admin && (
                <button
                  onClick={() => { setSelected(user); setReason('') }}
                  className={`shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    user.is_frozen
                      ? 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900'
                      : 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900'
                  }`}
                >
                  {user.is_frozen ? 'Aktifkan' : 'Bekukan'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}