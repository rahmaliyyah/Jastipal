'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { ChevronLeft, ImagePlus } from 'lucide-react'

type OrderDetail = {
  id: string
  product_name: string
  delivery_pref: 'courier' | 'meetup'
  status: string
  jastiper_id: string
}

export default function UploadProofPage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const receiptRef = useRef<HTMLInputElement>(null)
  const storePhotoRef = useRef<HTMLInputElement>(null)
  const boardingRef = useRef<HTMLInputElement>(null)

  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [courier, setCourier] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [storePhotoFile, setStorePhotoFile] = useState<File | null>(null)
  const [boardingFile, setBoardingFile] = useState<File | null>(null)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('orders')
        .select('id, product_name, delivery_pref, status, jastiper_id')
        .eq('id', orderId)
        .eq('jastiper_id', user.id)
        .single()

      if (!data) { router.push('/orders'); return }
      if ((data as any).status !== 'processing') { router.push('/orders'); return }

      setOrder(data as any)
      setLoading(false)
    }
    init()
  }, [])

  async function uploadFile(file: File, path: string) {
    const { error, data: uploadData } = await supabase.storage.from('proof-of-purchase').upload(path, file, { upsert: true })
    if (error) throw new Error('Storage error - bucket: proof-of-purchase, path: ' + path + ', msg: ' + error.message + ', status: ' + (error as any).statusCode)
    const { data } = supabase.storage.from('proof-of-purchase').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit() {
    if (!receiptFile) { setError('Struk pembelian wajib diupload'); return }
    if (order?.delivery_pref === 'courier' && !trackingNumber.trim()) {
      setError('Nomor resi wajib diisi untuk pengiriman courier')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const basePath = `${userId}/${orderId}`

      const receiptUrl = await uploadFile(receiptFile, `${basePath}/receipt.${receiptFile.name.split('.').pop()}`)

      let storePhotoUrl = null
      if (storePhotoFile) {
        storePhotoUrl = await uploadFile(storePhotoFile, `${basePath}/store_photo.${storePhotoFile.name.split('.').pop()}`)
      }

      let boardingUrl = null
      if (boardingFile) {
        boardingUrl = await uploadFile(boardingFile, `${basePath}/boarding.${boardingFile.name.split('.').pop()}`)
      }

      const { data: existingProof } = await supabase
        .from('proof_of_purchase')
        .select('id')
        .eq('order_id', orderId)
        .single()

      if (existingProof) {
        const { error: updateErr } = await supabase.from('proof_of_purchase').update({
          receipt_url: receiptUrl,
          store_photo_url: storePhotoUrl,
          boarding_pass_url: boardingUrl,
        }).eq('order_id', orderId)
        if (updateErr) throw new Error('Update proof gagal: ' + updateErr.message)
      } else {
        const { error: insertErr } = await supabase.from('proof_of_purchase').insert({
          order_id: orderId,
          jastiper_id: userId,
          receipt_url: receiptUrl,
          store_photo_url: storePhotoUrl,
          boarding_pass_url: boardingUrl,
        })
        if (insertErr) throw new Error('Insert proof gagal: ' + insertErr.message)
      }

      if (order?.delivery_pref === 'courier') {
        await supabase.from('orders').update({
          status: 'shipped',
          tracking_number: trackingNumber,
        }).eq('id', orderId)
      } else {
        await supabase.from('orders').update({
          status: 'shipped',
        }).eq('id', orderId)
      }

      setSuccess(true)
      setSubmitting(false)
      setTimeout(() => router.push('/orders'), 2000)
    } catch (err: any) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[#CBD5E1] border-t-[#49BC9E] rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!order) return null

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 sm:py-2">

        {/* BACK */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-[#64748B] text-[15px] hover:text-[#0F172A] transition-colors mb-4"
        >
          <ChevronLeft size={18} />
          Kembali
        </button>

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-[#0F172A]">Bukti Pembelian</h1>
          <p className="mt-1 text-[15px] text-[#64748B]">{order.product_name}</p>
        </div>

        {/* Info flow */}
        <div className={`mb-6 rounded-xl p-4 border ${
          order.delivery_pref === 'courier'
            ? 'bg-blue-50 border-blue-200'
            : 'bg-[#e6f7f3] border-[#b3e8d9]'
        }`}>
          <p className={`text-[14px] font-semibold mb-1 ${
            order.delivery_pref === 'courier' ? 'text-blue-800' : 'text-[#2d9b7f]'
          }`}>
            {order.delivery_pref === 'courier' ? 'Pengiriman Paket' : 'Meetup'}
          </p>
          <p className={`text-[13px] ${
            order.delivery_pref === 'courier' ? 'text-blue-600' : 'text-[#49BC9E]'
          }`}>
            {order.delivery_pref === 'courier'
              ? 'Upload struk + input nomor resi → status berubah ke Dikirim → buyer konfirmasi terima'
              : 'Upload struk sebagai bukti beli → buyer konfirmasi terima setelah meetup → dana cair'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-600 text-[14px]">{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-5 bg-[#e6f7f3] border border-[#b3e8d9] rounded-xl px-4 py-3">
            <p className="text-[#2d9b7f] text-[14px] font-medium">
              ✓ Berhasil! {order.delivery_pref === 'courier'
                ? 'Order ditandai sebagai Dikirim, buyer perlu konfirmasi terima.'
                : 'Struk berhasil diupload. Buyer perlu konfirmasi setelah meetup.'} Mengalihkan...
            </p>
          </div>
        )}

        {/* UPLOAD SECTION */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="text-[20px] font-bold text-[#0F172A] mb-6">Upload Bukti Pembelian</h2>

          {/* FOTO STRUK */}
          <div className="mb-6">
            <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
              Foto Struk / Invoice <span className="text-red-400">*</span>
            </label>
            <div
              onClick={() => receiptRef.current?.click()}
              className="border-2 border-dashed border-[#CBD5E1] rounded-xl h-[160px] flex flex-col items-center justify-center text-center px-4 cursor-pointer hover:border-[#49BC9E] transition-all"
            >
              {receiptFile ? (
                <>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#49BC9E] mb-2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <p className="text-[14px] font-semibold text-[#49BC9E]">{receiptFile.name}</p>
                  <p className="text-[13px] text-[#64748B] mt-1">Klik untuk ganti</p>
                </>
              ) : (
                <>
                  <ImagePlus size={28} className="text-[#94A3B8]" />
                  <p className="mt-2 text-[14px]">
                    <span className="text-[#49BC9E] font-medium">Upload a file</span>
                    <span className="text-[#64748B]"> or drag and drop</span>
                  </p>
                  <p className="text-[12px] text-[#94A3B8] mt-1">PNG, JPG, GIF up to 10MB</p>
                </>
              )}
            </div>
            <input ref={receiptRef} type="file" accept="image/*" className="hidden" onChange={e => setReceiptFile(e.target.files?.[0] ?? null)} />
          </div>

          {/* FOTO DI TOKO */}
          <div className="mb-6">
            <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
              Foto di Toko <span className="italic font-normal text-[#94A3B8]">(Opsional)</span>
            </label>
            <div
              onClick={() => storePhotoRef.current?.click()}
              className="border-2 border-dashed border-[#CBD5E1] rounded-xl h-[160px] flex flex-col items-center justify-center text-center px-4 cursor-pointer hover:border-[#49BC9E] transition-all"
            >
              {storePhotoFile ? (
                <>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#49BC9E] mb-2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <p className="text-[14px] font-semibold text-[#49BC9E]">{storePhotoFile.name}</p>
                  <p className="text-[13px] text-[#64748B] mt-1">Klik untuk ganti</p>
                </>
              ) : (
                <>
                  <ImagePlus size={28} className="text-[#94A3B8]" />
                  <p className="mt-2 text-[14px]">
                    <span className="text-[#49BC9E] font-medium">Upload a file</span>
                    <span className="text-[#64748B]"> or drag and drop</span>
                  </p>
                  <p className="text-[12px] text-[#94A3B8] mt-1">PNG, JPG, GIF up to 10MB</p>
                </>
              )}
            </div>
            <input ref={storePhotoRef} type="file" accept="image/*" className="hidden" onChange={e => setStorePhotoFile(e.target.files?.[0] ?? null)} />
          </div>

          {/* BOARDING PASS */}
          <div>
            <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
              Boarding Pass <span className="italic font-normal text-[#94A3B8]">(Opsional)</span>
            </label>
            <div
              onClick={() => boardingRef.current?.click()}
              className="border-2 border-dashed border-[#CBD5E1] rounded-xl h-[160px] flex flex-col items-center justify-center text-center px-4 cursor-pointer hover:border-[#49BC9E] transition-all"
            >
              {boardingFile ? (
                <>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#49BC9E] mb-2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <p className="text-[14px] font-semibold text-[#49BC9E]">{boardingFile.name}</p>
                  <p className="text-[13px] text-[#64748B] mt-1">Klik untuk ganti</p>
                </>
              ) : (
                <>
                  <ImagePlus size={28} className="text-[#94A3B8]" />
                  <p className="mt-2 text-[14px]">
                    <span className="text-[#49BC9E] font-medium">Upload a file</span>
                    <span className="text-[#64748B]"> or drag and drop</span>
                  </p>
                  <p className="text-[12px] text-[#94A3B8] mt-1">PNG, JPG, GIF up to 10MB</p>
                </>
              )}
            </div>
            <input ref={boardingRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={e => setBoardingFile(e.target.files?.[0] ?? null)} />
          </div>
        </div>

        {/* NOMOR RESI — hanya untuk courier */}
        {order.delivery_pref === 'courier' && (
          <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-8 mb-6">
            <h2 className="text-[20px] font-bold text-[#0F172A] mb-5">Nomor Resi</h2>

            <div className="mb-5">
              <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
                Ekspedisi Pengiriman
              </label>
              <input
                type="text"
                value={courier}
                onChange={e => setCourier(e.target.value)}
                placeholder="Masukkan ekspedisi pengiriman"
                className="w-full h-[48px] rounded-xl border border-[#CBD5E1] px-4 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#49BC9E] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
                Nomor Resi <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                placeholder="Contoh: JNE123456789"
                className="w-full h-[48px] rounded-xl border border-[#CBD5E1] px-4 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#49BC9E] transition-colors"
              />
              <p className="text-[12px] text-[#94A3B8] mt-1">Nomor resi akan ditampilkan ke buyer untuk tracking</p>
            </div>
          </div>
        )}

        {/* SUBMIT */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting || success}
            className="h-[52px] px-8 rounded-xl bg-[#49BC9E] hover:bg-[#3da88d] text-white font-semibold text-[16px] shadow-lg shadow-teal-100 disabled:opacity-50 transition-all"
          >
            {submitting ? 'Mengirim...' : success ? 'Berhasil!' : order.delivery_pref === 'courier' ? 'Kirim Bukti & Pengiriman' : 'Upload Struk Pembelian'}
          </button>
        </div>

        {/* FOOTNOTE */}
        <p className="mt-4 text-center text-[13px] text-[#94A3B8] leading-relaxed pb-8">
          {order.delivery_pref === 'courier'
            ? 'Dana akan cair otomatis setelah buyer mengonfirmasi penerimaan barang.'
            : 'Buyer perlu konfirmasi terima setelah meetup — dana cair otomatis setelah konfirmasi.'}
        </p>

      </div>
    </main>
  )
}