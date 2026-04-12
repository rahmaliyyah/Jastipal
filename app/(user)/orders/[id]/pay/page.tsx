'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'

type OrderDetail = {
  id: string
  product_name: string
  status: string
  pricing: {
    product_price_idr: number
    platform_fee_idr: number
    total_idr: number
  } | null
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default function PayOrderPage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('orders')
        .select('id, product_name, status')
        .eq('id', orderId)
        .eq('buyer_id', user.id)
        .single()

      if (!data) { router.push('/orders'); return }
      if ((data as any).status !== 'waiting_payment') { router.push('/orders'); return }

      // ambil pricing terpisah
      const { data: pricingData } = await supabase
        .from('order_pricing')
        .select('product_price_idr, platform_fee_idr, total_idr')
        .eq('order_id', orderId)
        .single()

      setOrder({
        ...(data as any),
        pricing: pricingData ?? null,
      })
      setLoading(false)
    }
    init()
  }, [])

  async function handleSubmit() {
    if (!proofFile) { setError('Bukti transfer wajib diupload'); return }
    if (!paymentMethod.trim()) { setError('Metode pembayaran wajib diisi'); return }

    setSubmitting(true)
    setError('')

    const fileExt = proofFile.name.split('.').pop()
    const filePath = `${userId}/${orderId}/payment_proof.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(filePath, proofFile, { upsert: true })

    if (uploadError) {
      setError('Gagal upload bukti transfer: ' + uploadError.message)
      setSubmitting(false)
      return
    }

    const { data: urlData } = supabase.storage.from('payment-proofs').getPublicUrl(filePath)

    await supabase.from('escrow_transactions').update({
      payment_method: paymentMethod,
      payment_proof_url: urlData.publicUrl,
      paid_at: new Date().toISOString(),
      status: 'held',
    }).eq('order_id', orderId)

    await supabase.from('orders').update({ status: 'processing' }).eq('id', orderId)

    router.push('/orders')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 flex items-center gap-1 transition-all"
        >
          ← Kembali
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Pembayaran</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{order.product_name}</p>
      </div>

      <div className="space-y-5">

        {/* Rekening tujuan */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-4">Transfer ke Rekening Berikut</h2>
          <div className="space-y-3">
            {[
              { bank: 'BCA', no: '1234567890', name: 'PT Jastipal Indonesia' },
              { bank: 'BRI', no: '0987654321', name: 'PT Jastipal Indonesia' },
              { bank: 'Mandiri', no: '1122334455', name: 'PT Jastipal Indonesia' },
            ].map(r => (
              <div key={r.bank} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{r.bank}</p>
                  <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">{r.no}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{r.name}</p>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(r.no)}
                  className="text-xs text-blue-500 hover:text-blue-600 font-medium transition-all"
                >
                  Salin
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Rincian pembayaran */}
        {order.pricing && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-4">Rincian Pembayaran</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Harga fix (all-in)</span>
                <span>{formatRupiah(order.pricing.product_price_idr)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Platform fee (5%)</span>
                <span>{formatRupiah(order.pricing.platform_fee_idr)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>Total Transfer</span>
                <span className="text-blue-600 dark:text-blue-400">{formatRupiah(order.pricing.total_idr)}</span>
              </div>
            </div>
            <div className="mt-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg px-3 py-2">
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Transfer tepat sesuai nominal di atas untuk mempercepat verifikasi
              </p>
            </div>
          </div>
        )}

        {/* Upload bukti */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Upload Bukti Transfer</h2>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Metode pembayaran <span className="text-red-400">*</span>
            </label>
            <input
              placeholder="Contoh: BCA Mobile, BRI Direct, Mandiri Livin"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Screenshot bukti transfer <span className="text-red-400">*</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-5 text-center cursor-pointer hover:border-gray-400 transition-all"
            >
              {proofFile ? (
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">✓ {proofFile.name}</p>
                  <p className="text-xs text-gray-400 mt-1">Klik untuk ganti</p>
                </div>
              ) : (
                <div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 text-gray-400">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Klik untuk upload screenshot</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG — maks 5MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => setProofFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl py-3 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {submitting ? 'Mengirim bukti...' : 'Konfirmasi Sudah Transfer'}
        </button>

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center pb-6">
          Setelah bukti diterima dan diverifikasi, order akan diproses oleh jastiper
        </p>
      </div>
    </div>
  )
}