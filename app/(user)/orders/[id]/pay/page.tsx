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

    router.push('/orders')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#49BC9E] rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!order) return null

  const banks = [
    { bank: 'BCA', no: '1234567890', name: 'PT Jastipal Indonesia' },
    { bank: 'BRI', no: '0987654321', name: 'PT Jastipal Indonesia' },
    { bank: 'Mandiri', no: '1122334455', name: 'PT Jastipal Indonesia' },
  ]

  return (
    <div className="max-w-3xl pb-12">

      {/* Back + Title */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali
      </button>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Pembayaran</h1>
        <p className="text-sm text-gray-500">{order.product_name}</p>
      </div>

      <div className="flex flex-col gap-4">

        {/* Card: Transfer ke Rekening Berikut */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Transfer ke Rekening Berikut</h2>
          <div className="grid grid-cols-2 gap-3">
            {banks.map(r => (
              <div key={r.bank} className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3">
                <div>
                  <p className="text-xs text-[#49BC9E] mb-0.5">{r.name}</p>
                  <p className="text-sm font-semibold text-gray-900">{r.bank} • {r.no}</p>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(r.no)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Card: Rincian Tagihan */}
        {order.pricing && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Rincian Tagihan</h2>

            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[#49BC9E]">Harga (Produk & Fee Jastiper)</p>
              <p className="text-sm font-semibold text-gray-900">{formatRupiah(order.pricing.product_price_idr)}</p>
            </div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#49BC9E]">Platform Fee (5%)</p>
              <p className="text-sm font-semibold text-gray-900">{formatRupiah(order.pricing.platform_fee_idr)}</p>
            </div>

            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-900">Total Tagihan</p>
              <p className="text-sm font-bold text-[#49BC9E]">{formatRupiah(order.pricing.total_idr)}</p>
            </div>

            <p className="text-xs text-gray-400 flex items-center gap-1">
              <span>ⓘ</span>
              Mohon transfer sesuai nominal untuk mempercepat proses verifikasi.
            </p>
          </div>
        )}

        {/* Card: Upload Bukti Transfer */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Upload Bukti Transfer</h2>

          {/* Metode Pembayaran */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Metode Pembayaran
            </label>
            <input
              type="text"
              placeholder="Contoh: BCA Mobile, BRI Direct, Mandiri Livin"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#49BC9E] transition-colors"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
            />
          </div>

          {/* Upload Area */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Upload Bukti Transfer
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg px-6 py-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#49BC9E] transition-colors"
            >
              {proofFile ? (
                <>
                  <p className="text-sm text-[#49BC9E] font-medium">✓ {proofFile.name}</p>
                  <p className="text-xs text-gray-400">Klik untuk ganti</p>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-400">
                    <span className="text-[#49BC9E] font-medium hover:underline">Upload a file</span>
                    {' '}or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                </>
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

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-[#49BC9E] hover:bg-[#3da88d] disabled:opacity-50 transition-colors text-white text-sm font-semibold py-3 rounded-lg"
          >
            {submitting ? 'Mengirim bukti...' : 'Kirim Bukti Pembayaran'}
          </button>
        </div>

      </div>
    </div>
  )
}