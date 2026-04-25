'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'

type OrderDetail = {
  id: string
  product_name: string
  status: string
  buyer_id: string
  jastiper_id: string
}

export default function OpenDisputePage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [userId, setUserId] = useState('')
  const [activeRole, setActiveRole] = useState<'buyer' | 'jastiper'>('buyer')
  const [reason, setReason] = useState('')
  const [selectedReason, setSelectedReason] = useState('')
  const [existingDispute, setExistingDispute] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: userData } = await supabase
        .from('users')
        .select('active_role')
        .eq('id', user.id)
        .single()
      setActiveRole(userData?.active_role ?? 'buyer')

      const { data: orderData } = await supabase
        .from('orders')
        .select('id, product_name, status, buyer_id, jastiper_id')
        .eq('id', orderId)
        .single()

      if (!orderData) { router.push('/orders'); return }

      // cek apakah user terlibat di order ini
      if (orderData.buyer_id !== user.id && orderData.jastiper_id !== user.id) {
        router.push('/orders')
        return
      }

      // cek apakah sudah ada dispute
      const { data: disputeData } = await supabase
        .from('disputes')
        .select('id')
        .eq('order_id', orderId)
        .single()

      if (disputeData) setExistingDispute(true)

      setOrder(orderData as any)
      setLoading(false)
    }
    init()
  }, [])

  async function handleSubmit() {
    if (!reason.trim()) { setError('Alasan dispute wajib diisi'); return }
    setSubmitting(true)
    setError('')

    const { error: insertError } = await supabase.from('disputes').insert({
      order_id: orderId,
      raised_by: userId,
      reason: reason,
      status: 'open',
    })

    if (insertError) {
      setError('Gagal membuka dispute: ' + insertError.message)
      setSubmitting(false)
      return
    }

    setSuccess(true)
    setSubmitting(false)
    setTimeout(() => router.push('/orders'), 2000)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
    </div>
  )

  if (!order) return null

  return (
    <div className="max-w-lg">
      <button onClick={() => router.back()} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 flex items-center gap-1 transition-all">
        ← Kembali
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Buka Dispute</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{order.product_name}</p>
      </div>

      {existingDispute && (
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-xl px-4 py-3 mb-5">
          <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">⚠️ Dispute sudah pernah dibuka untuk order ini</p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Admin sedang memproses dispute ini. Harap tunggu.</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 mb-5">
          <p className="text-sm text-green-700 dark:text-green-300 font-medium">✓ Dispute berhasil dibuka! Admin akan segera meninjau.</p>
        </div>
      )}

      {!existingDispute && !success && (
        <div className="space-y-5">
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">⚠️ Perhatian</p>
            <p className="text-xs text-red-600 dark:text-red-400">
              Dispute akan diproses oleh admin. Pastikan kamu sudah mencoba menghubungi {activeRole === 'buyer' ? 'jastiper' : 'buyer'} via WhatsApp sebelum membuka dispute.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Detail Dispute</h2>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Pilih alasan <span className="text-red-400">*</span>
              </label>
              <div className="space-y-2">
                {(activeRole === 'buyer' ? [
                  'Barang tidak sampai setelah waktu yang dijanjikan',
                  'Barang rusak atau tidak sesuai deskripsi',
                  'Jastiper tidak responsif',
                  'Jastiper tidak membeli barang',
                  'Lainnya',
                ] : [
                  'Buyer tidak konfirmasi terima padahal barang sudah dikirim',
                  'Buyer tidak bisa dihubungi',
                  'Lainnya',
                ]).map(option => (
                  <button
                    key={option}
                    onClick={() => { setSelectedReason(option); setReason(option !== 'Lainnya' ? option : '') }}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                      selectedReason === option
                        ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800 font-medium text-gray-900 dark:text-white'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {selectedReason === option && <span className="mr-2">✓</span>}{option}
                  </button>
                ))}
              </div>
            </div>

            {selectedReason === 'Lainnya' && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Jelaskan masalahmu <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Ceritakan detail masalah yang kamu alami..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  onChange={e => setReason(e.target.value)}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || !reason.trim()}
            className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50 transition-all"
          >
            {submitting ? 'Membuka dispute...' : 'Buka Dispute'}
          </button>
        </div>
      )}
    </div>
  )
}