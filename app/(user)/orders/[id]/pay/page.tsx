'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'

export default function ProofOfPurchasePage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const receiptRef = useRef<HTMLInputElement>(null)
  const storePhotoRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')
  const [productName, setProductName] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [storePhotoFile, setStorePhotoFile] = useState<File | null>(null)
  const [alreadyUploaded, setAlreadyUploaded] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: order } = await supabase
        .from('orders')
        .select('product_name, status, jastiper_id')
        .eq('id', orderId)
        .single()

      if (!order || order.jastiper_id !== user.id) { router.push('/orders'); return }
      if (order.status !== 'processing') { router.push('/orders'); return }

      setProductName(order.product_name ?? '')

      // cek apakah sudah pernah upload
      const { data: existing } = await supabase
        .from('proof_of_purchase')
        .select('id')
        .eq('order_id', orderId)
        .single()

      if (existing) setAlreadyUploaded(true)
      setLoading(false)
    }
    init()
  }, [])

  async function handleSubmit() {
    if (!receiptFile) { setError('Foto struk pembelian wajib diupload'); return }
    setSubmitting(true)
    setError('')

    // upload struk
    const receiptExt = receiptFile.name.split('.').pop()
    const receiptPath = `${userId}/${orderId}/receipt.${receiptExt}`
    const { error: receiptErr } = await supabase.storage
      .from('proof-of-purchase')
      .upload(receiptPath, receiptFile, { upsert: true })

    if (receiptErr) {
      setError('Gagal upload struk: ' + receiptErr.message)
      setSubmitting(false)
      return
    }

    const { data: receiptUrl } = supabase.storage.from('proof-of-purchase').getPublicUrl(receiptPath)

    let storePhotoUrl = null
    if (storePhotoFile) {
      const storeExt = storePhotoFile.name.split('.').pop()
      const storePath = `${userId}/${orderId}/store_photo.${storeExt}`
      await supabase.storage.from('proof-of-purchase').upload(storePath, storePhotoFile, { upsert: true })
      const { data: storeUrl } = supabase.storage.from('proof-of-purchase').getPublicUrl(storePath)
      storePhotoUrl = storeUrl.publicUrl
    }

    // insert atau update proof_of_purchase
    await supabase.from('proof_of_purchase').upsert({
      order_id: orderId,
      jastiper_id: userId,
      receipt_url: receiptUrl.publicUrl,
      store_photo_url: storePhotoUrl,
    }, { onConflict: 'order_id' })

    router.push('/orders')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
      </div>
    )
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
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Upload Struk Pembelian</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{productName}</p>
      </div>

      {alreadyUploaded && (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 mb-5">
          <p className="text-sm text-green-700 dark:text-green-300">✓ Struk sudah pernah diupload. Kamu bisa upload ulang jika perlu.</p>
        </div>
      )}

      <div className="space-y-5">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-5">

          {/* Struk pembelian */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Foto struk / nota pembelian <span className="text-red-400">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-2">Struk dari toko tempat kamu membeli barang</p>
            <div
              onClick={() => receiptRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-5 text-center cursor-pointer hover:border-gray-400 transition-all"
            >
              {receiptFile ? (
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">✓ {receiptFile.name}</p>
                  <p className="text-xs text-gray-400 mt-1">Klik untuk ganti</p>
                </div>
              ) : (
                <div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 text-gray-400">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Klik untuk upload foto struk</p>
                  <p className="text-xs text-gray-400 mt-1">JPG atau PNG</p>
                </div>
              )}
            </div>
            <input ref={receiptRef} type="file" accept="image/*" className="hidden" onChange={e => setReceiptFile(e.target.files?.[0] ?? null)} />
          </div>

          {/* Foto di toko */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Foto di toko <span className="text-gray-400 text-xs font-normal">(opsional)</span>
            </label>
            <p className="text-xs text-gray-400 mb-2">Foto kamu atau barang di lokasi toko sebagai bukti tambahan</p>
            <div
              onClick={() => storePhotoRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-5 text-center cursor-pointer hover:border-gray-400 transition-all"
            >
              {storePhotoFile ? (
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">✓ {storePhotoFile.name}</p>
                  <p className="text-xs text-gray-400 mt-1">Klik untuk ganti</p>
                </div>
              ) : (
                <div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 text-gray-400">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Klik untuk upload foto di toko</p>
                  <p className="text-xs text-gray-400 mt-1">JPG atau PNG</p>
                </div>
              )}
            </div>
            <input ref={storePhotoRef} type="file" accept="image/*" className="hidden" onChange={e => setStorePhotoFile(e.target.files?.[0] ?? null)} />
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Struk pembelian digunakan sebagai bukti bahwa kamu benar-benar membeli barang untuk buyer. Dokumen ini akan digunakan admin jika terjadi dispute.
          </p>
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
          {submitting ? 'Mengupload...' : 'Upload Struk'}
        </button>
      </div>
    </div>
  )
}