'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'

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

      // cek apakah sudah ada proof untuk order ini
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
        // courier: tandai shipped dengan nomor resi
        await supabase.from('orders').update({
          status: 'shipped',
          tracking_number: trackingNumber,
        }).eq('id', orderId)
      } else {
        // meetup: jastiper hanya upload struk, status tetap processing
        // buyer yang akan konfirmasi terima barang setelah ketemu
        await supabase.from('orders').update({
          status: 'shipped', // pakai shipped agar buyer bisa konfirmasi
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
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 flex items-center gap-1 transition-all">
          ← Kembali
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Upload Bukti Pembelian</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{order.product_name}</p>
      </div>

      {/* Info flow */}
      <div className={`rounded-xl p-4 mb-5 border ${
        order.delivery_pref === 'courier'
          ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
          : 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
      }`}>
        <p className={`text-sm font-medium mb-1 ${order.delivery_pref === 'courier' ? 'text-blue-800 dark:text-blue-200' : 'text-green-800 dark:text-green-200'}`}>
          {order.delivery_pref === 'courier' ? '📦 Pengiriman Courier' : '🤝 Meetup'}
        </p>
        <p className={`text-xs ${order.delivery_pref === 'courier' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`}>
          {order.delivery_pref === 'courier'
            ? 'Upload struk + input nomor resi → status berubah ke Dikirim → buyer konfirmasi terima'
            : 'Upload struk sebagai bukti beli → buyer konfirmasi terima setelah meetup → dana cair'}
        </p>
      </div>

      <div className="space-y-5">

        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Bukti pembelian */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Bukti Pembelian</h2>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Foto struk / invoice <span className="text-red-400">*</span>
            </label>
            <div onClick={() => receiptRef.current?.click()} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-all">
              {receiptFile ? (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">✓ {receiptFile.name}</p>
              ) : (
                <p className="text-sm text-gray-400">Klik untuk upload struk pembelian</p>
              )}
            </div>
            <input ref={receiptRef} type="file" accept="image/*" className="hidden" onChange={e => setReceiptFile(e.target.files?.[0] ?? null)} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Foto di toko <span className="text-gray-400 text-xs font-normal">(opsional)</span>
            </label>
            <div onClick={() => storePhotoRef.current?.click()} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-all">
              {storePhotoFile ? (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">✓ {storePhotoFile.name}</p>
              ) : (
                <p className="text-sm text-gray-400">Klik untuk upload foto di toko (opsional)</p>
              )}
            </div>
            <input ref={storePhotoRef} type="file" accept="image/*" className="hidden" onChange={e => setStorePhotoFile(e.target.files?.[0] ?? null)} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Boarding pass <span className="text-gray-400 text-xs font-normal">(opsional)</span>
            </label>
            <div onClick={() => boardingRef.current?.click()} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-all">
              {boardingFile ? (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">✓ {boardingFile.name}</p>
              ) : (
                <p className="text-sm text-gray-400">Klik untuk upload boarding pass (opsional)</p>
              )}
            </div>
            <input ref={boardingRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={e => setBoardingFile(e.target.files?.[0] ?? null)} />
          </div>
        </div>

        {/* Nomor resi — hanya untuk courier */}
        {order.delivery_pref === 'courier' && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-4">Nomor Resi <span className="text-red-400">*</span></h2>
            <input
              placeholder="Contoh: JNE123456789"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={trackingNumber}
              onChange={e => setTrackingNumber(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">Nomor resi akan ditampilkan ke buyer untuk tracking</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
            <p className="text-green-700 dark:text-green-300 text-sm font-medium">
              ✓ Berhasil! {order.delivery_pref === 'courier' ? 'Order ditandai sebagai Dikirim, buyer perlu konfirmasi terima.' : 'Struk berhasil diupload. Buyer perlu konfirmasi setelah meetup.'} Mengalihkan ke halaman pesanan...
            </p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || success}
          className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl py-3 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {submitting ? 'Mengirim...' : success ? 'Berhasil!' : order.delivery_pref === 'courier' ? 'Upload & Tandai Dikirim' : 'Upload Struk Pembelian'}
        </button>

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center pb-6">
          {order.delivery_pref === 'courier'
            ? 'Buyer akan diminta mengkonfirmasi penerimaan barang'
            : 'Buyer perlu konfirmasi terima setelah meetup — dana cair otomatis setelah konfirmasi'}
        </p>
      </div>
    </div>
  )
}