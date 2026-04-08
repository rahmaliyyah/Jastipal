'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type KycApplicant = {
  user_id: string
  bio: string | null
  service_fee_pct: number | null
  base_country: string | null
  whatsapp_number: string | null
  kyc_idcard_url: string | null
  kyc_selfie_url: string | null
  kyc_status: 'pending' | 'approved' | 'rejected'
  users: {
    full_name: string
    email: string
    avatar_url: string | null
  }
}

export default function AdminDashboard() {
  const supabase = createClient()
  const router = useRouter()

  const [applicants, setApplicants] = useState<KycApplicant[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<KycApplicant | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionSuccess, setActionSuccess] = useState('')
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [previewImg, setPreviewImg] = useState<string | null>(null)

  useEffect(() => {
    fetchApplicants()
  }, [tab])

  async function fetchApplicants() {
    setLoading(true)
    const { data } = await supabase
      .from('jastiper_profiles')
      .select('user_id, bio, service_fee_pct, base_country, whatsapp_number, kyc_idcard_url, kyc_selfie_url, kyc_status, users(full_name, email, avatar_url)')
      .eq('kyc_status', tab)
      .order('kyc_status')

    setApplicants((data as any) ?? [])
    setLoading(false)
  }

  async function handleApprove(applicant: KycApplicant) {
    setActionLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('jastiper_profiles').update({
      kyc_status: 'approved',
      kyc_reviewed_at: new Date().toISOString(),
      kyc_reviewed_by: user?.id,
      kyc_rejection_reason: null,
    }).eq('user_id', applicant.user_id)

    await supabase.from('users').update({ is_jastiper: true }).eq('id', applicant.user_id)

    await supabase.from('admin_actions').insert({
      admin_id: user?.id,
      target_user_id: applicant.user_id,
      action_type: 'approve_jastiper',
      reason: 'KYC dokumen valid',
    })

    setActionSuccess(`${applicant.users.full_name} berhasil disetujui sebagai jastiper`)
    setSelected(null)
    setActionLoading(false)
    fetchApplicants()
  }

  async function handleReject(applicant: KycApplicant) {
    if (!rejectReason.trim()) return
    setActionLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('jastiper_profiles').update({
      kyc_status: 'rejected',
      kyc_reviewed_at: new Date().toISOString(),
      kyc_reviewed_by: user?.id,
      kyc_rejection_reason: rejectReason,
    }).eq('user_id', applicant.user_id)

    await supabase.from('admin_actions').insert({
      admin_id: user?.id,
      target_user_id: applicant.user_id,
      action_type: 'reject_jastiper',
      reason: rejectReason,
    })

    setActionSuccess(`Pengajuan ${applicant.users.full_name} ditolak`)
    setSelected(null)
    setRejectReason('')
    setActionLoading(false)
    fetchApplicants()
  }

  const tabCounts = { pending: 0, approved: 0, rejected: 0 }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Image preview modal */}
      {previewImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewImg(null)}
        >
          <img src={previewImg} alt="preview" className="max-w-full max-h-[90vh] rounded-xl object-contain" />
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Detail Pengajuan KYC</h2>
              <button onClick={() => { setSelected(null); setRejectReason('') }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* User info */}
              <div className="flex items-center gap-3">
                {selected.users.avatar_url ? (
                  <img src={selected.users.avatar_url} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-semibold uppercase">
                    {selected.users.full_name?.[0] ?? '?'}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{selected.users.full_name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selected.users.email}</p>
                </div>
              </div>

              {/* Info jastiper */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Domisili</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.base_country ?? '-'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Service Fee</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.service_fee_pct ? `${selected.service_fee_pct}%` : '-'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">WhatsApp</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.whatsapp_number ?? '-'}</p>
                </div>
              </div>

              {selected.bio && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bio</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selected.bio}</p>
                </div>
              )}

              {/* Dokumen KYC */}
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Dokumen KYC</p>
                <div className="grid grid-cols-2 gap-3">
                  {selected.kyc_idcard_url ? (
                    <div
                      className="cursor-pointer rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:opacity-80 transition-all"
                      onClick={() => setPreviewImg(selected.kyc_idcard_url)}
                    >
                      <img src={selected.kyc_idcard_url} alt="KTP" className="w-full h-28 object-cover" />
                      <p className="text-xs text-center text-gray-500 py-1.5">KTP / Passport</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 h-28 flex items-center justify-center">
                      <p className="text-xs text-gray-400">Tidak ada foto</p>
                    </div>
                  )}
                  {selected.kyc_selfie_url ? (
                    <div
                      className="cursor-pointer rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:opacity-80 transition-all"
                      onClick={() => setPreviewImg(selected.kyc_selfie_url)}
                    >
                      <img src={selected.kyc_selfie_url} alt="Selfie" className="w-full h-28 object-cover" />
                      <p className="text-xs text-center text-gray-500 py-1.5">Selfie + KTP</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 h-28 flex items-center justify-center">
                      <p className="text-xs text-gray-400">Tidak ada foto</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              {selected.kyc_status === 'pending' && (
                <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                      Alasan penolakan (wajib diisi jika menolak)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Contoh: Foto KTP buram, tidak terbaca"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(selected)}
                      disabled={actionLoading || !rejectReason.trim()}
                      className="flex-1 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg py-2.5 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-40 transition-all"
                    >
                      {actionLoading ? 'Memproses...' : 'Tolak'}
                    </button>
                    <button
                      onClick={() => handleApprove(selected)}
                      disabled={actionLoading}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-40 transition-all"
                    >
                      {actionLoading ? 'Memproses...' : 'Setujui'}
                    </button>
                  </div>
                </div>
              )}

              {selected.kyc_status === 'approved' && (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <p className="text-sm text-green-700 dark:text-green-300">Sudah disetujui sebagai jastiper</p>
                </div>
              )}

              {selected.kyc_status === 'rejected' && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Alasan penolakan:</p>
                  <p className="text-sm text-red-700 dark:text-red-300">-</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Jastipal</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Dashboard verifikasi jastiper</p>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all"
          >
            Keluar
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Success toast */}
        {actionSuccess && (
          <div className="mb-6 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-green-700 dark:text-green-300">{actionSuccess}</p>
            <button onClick={() => setActionSuccess('')} className="text-green-500 hover:text-green-700 ml-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit mb-6">
          {(['pending', 'approved', 'rejected'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                tab === t
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {t === 'pending' ? 'Menunggu' : t === 'approved' ? 'Disetujui' : 'Ditolak'}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          </div>
        ) : applicants.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {tab === 'pending' ? 'Tidak ada pengajuan yang menunggu review' : tab === 'approved' ? 'Belum ada jastiper yang disetujui' : 'Tidak ada pengajuan yang ditolak'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {applicants.map(applicant => (
              <div
                key={applicant.user_id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer"
                onClick={() => setSelected(applicant)}
              >
                <div className="flex items-center gap-3 mb-4">
                  {applicant.users.avatar_url ? (
                    <img src={applicant.users.avatar_url} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-sm font-semibold uppercase">
                      {applicant.users.full_name?.[0] ?? '?'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{applicant.users.full_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{applicant.users.email}</p>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {applicant.base_country ?? 'Tidak disebutkan'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    Fee {applicant.service_fee_pct ? `${applicant.service_fee_pct}%` : '-'}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    applicant.kyc_status === 'pending'
                      ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300'
                      : applicant.kyc_status === 'approved'
                      ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                  }`}>
                    {applicant.kyc_status === 'pending' ? 'Menunggu' : applicant.kyc_status === 'approved' ? 'Disetujui' : 'Ditolak'}
                  </span>
                  <span className="text-xs text-blue-500 hover:text-blue-600">Lihat detail →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}