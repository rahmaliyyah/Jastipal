'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewListingPage() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    trip_country: '',
    arrival_date: '',
    max_weight_kg: '',
    product_url: '',
    product_name: '',
    product_price_idr: '',
    service_fee_idr: '',
    shipping_fee_idr: '',
  })

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('users')
        .select('is_jastiper, active_role')
        .eq('id', user.id)
        .single()

      if (!data?.is_jastiper || data.active_role !== 'jastiper') {
        router.push('/dashboard')
        return
      }

      setUserId(user.id)
    }
    init()
  }, [])

  function formatRupiah(n: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
  }

  const productPrice = parseFloat(form.product_price_idr) || 0
  const serviceFee = parseFloat(form.service_fee_idr) || 0
  const shippingFee = parseFloat(form.shipping_fee_idr) || 0
  const totalPrice = productPrice + serviceFee + shippingFee

  async function handleSubmit() {
    if (!form.title.trim()) { setError('Judul listing wajib diisi'); return }
    if (!form.trip_country.trim()) { setError('Negara tujuan wajib diisi'); return }
    if (!form.arrival_date) { setError('Tanggal tiba wajib diisi'); return }
    if (!form.product_name.trim()) { setError('Nama produk wajib diisi'); return }
    if (!form.product_price_idr) { setError('Harga produk wajib diisi'); return }

    setLoading(true)
    setError('')

    const { error: insertError } = await supabase.from('listings').insert({
      jastiper_id: userId,
      title: form.title,
      description: form.description || null,
      trip_country: form.trip_country,
      arrival_date: form.arrival_date,
      max_weight_kg: form.max_weight_kg ? parseFloat(form.max_weight_kg) : null,
      product_url: form.product_url || null,
      product_name: form.product_name,
      product_price_idr: productPrice,
      service_fee_idr: serviceFee,
      shipping_fee_idr: shippingFee,
      total_price_idr: totalPrice,
      status: 'open',
    })

    if (insertError) {
      setError('Gagal membuat listing: ' + insertError.message)
      setLoading(false)
      return
    }

    router.push('/listings')
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 flex items-center gap-1 transition-all">
          ← Kembali
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Buat Listing</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tawarkan jasa titip kamu ke buyer</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-5">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-5">

        {/* Info Trip */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Info Trip</h2>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Judul listing <span className="text-red-400">*</span>
            </label>
            <input
              placeholder="Contoh: Titip beli dari Tokyo, Jepang — April 2026"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Deskripsi <span className="text-gray-400 text-xs font-normal">(opsional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Ceritakan detail tripmu, didaerah apa, kategori barang apa saja, dsb..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Negara tujuan <span className="text-red-400">*</span>
              </label>
              <input
                placeholder="Contoh: Jepang"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={form.trip_country}
                onChange={e => setForm({ ...form, trip_country: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Tanggal tiba di Indonesia <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={form.arrival_date}
                onChange={e => setForm({ ...form, arrival_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Max berat barang (kg) <span className="text-gray-400 text-xs font-normal">(opsional)</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="Contoh: 2.5"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={form.max_weight_kg}
              onChange={e => setForm({ ...form, max_weight_kg: e.target.value })}
            />
          </div>
        </div>

        {/* Info Produk */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Info Produk</h2>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Nama produk <span className="text-red-400">*</span>
            </label>
            <input
              placeholder="Contoh: Nintendo Switch OLED"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={form.product_name}
              onChange={e => setForm({ ...form, product_name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Link produk <span className="text-gray-400 text-xs font-normal">(opsional)</span>
            </label>
            <input
              type="url"
              placeholder="https://..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={form.product_url}
              onChange={e => setForm({ ...form, product_url: e.target.value })}
            />
          </div>
        </div>

        {/* Harga */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Rincian Harga (IDR)</h2>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Harga produk <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">Rp</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={form.product_price_idr}
                  onChange={e => setForm({ ...form, product_price_idr: e.target.value })}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Harga barang dalam rupiah (sudah dikonversi dari mata uang asal)</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Service fee <span className="text-gray-400 text-xs font-normal">(opsional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">Rp</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={form.service_fee_idr}
                  onChange={e => setForm({ ...form, service_fee_idr: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Ongkir <span className="text-gray-400 text-xs font-normal">(opsional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">Rp</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={form.shipping_fee_idr}
                  onChange={e => setForm({ ...form, shipping_fee_idr: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Total preview */}
          {totalPrice > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Harga produk</span>
                <span>{formatRupiah(productPrice)}</span>
              </div>
              {serviceFee > 0 && (
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Service fee</span>
                  <span>{formatRupiah(serviceFee)}</span>
                </div>
              )}
              {shippingFee > 0 && (
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Ongkir</span>
                  <span>{formatRupiah(shippingFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold text-gray-900 dark:text-white pt-1.5 border-t border-gray-200 dark:border-gray-700">
                <span>Total harga listing</span>
                <span>{formatRupiah(totalPrice)}</span>
              </div>
              <p className="text-xs text-gray-400">Buyer akan membayar total ini + platform fee 5%</p>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl py-3 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading ? 'Membuat listing...' : 'Buat Listing'}
        </button>
      </div>
    </div>
  )
}