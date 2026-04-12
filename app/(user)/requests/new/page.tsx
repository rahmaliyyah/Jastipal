'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type DeliveryPref = 'courier' | 'meetup'

export default function NewRequestPage() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    product_url: '',
    product_name: '',
    quantity: 1,
    max_budget_idr: '',
    deadline: '',
    delivery_pref: 'courier' as DeliveryPref,
    shipping_address: '',
    meetup_location: '',
    meetup_time: '',
    notes: '',
  })

  function set(key: string, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit() {
    if (!form.product_url || !form.product_name || !form.max_budget_idr || !form.deadline) {
      setError('Mohon lengkapi semua field yang wajib diisi')
      return
    }
    if (form.delivery_pref === 'courier' && !form.shipping_address) {
      setError('Alamat pengiriman wajib diisi untuk pilihan courier')
      return
    }
    if (form.delivery_pref === 'meetup' && (!form.meetup_location || !form.meetup_time)) {
      setError('Lokasi dan waktu meetup wajib diisi')
      return
    }

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const payload: any = {
      buyer_id: user.id,
      product_url: form.product_url,
      product_name: form.product_name,
      quantity: form.quantity,
      max_budget_idr: parseFloat(form.max_budget_idr),
      deadline: form.deadline,
      delivery_pref: form.delivery_pref,
      notes: form.notes || null,
      status: 'open',
    }

    if (form.delivery_pref === 'courier') {
      payload.shipping_address = form.shipping_address
    } else {
      payload.meetup_location = form.meetup_location
      payload.meetup_time = new Date(form.meetup_time).toISOString()
    }

    const { error: insertError } = await supabase.from('requests').insert(payload)

    if (insertError) {
      setError('Gagal membuat request: ' + insertError.message)
      setLoading(false)
      return
    }

    router.push('/requests')
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
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Buat Request</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Minta jastiper untuk belikan barang dari luar negeri
        </p>
      </div>

      <div className="space-y-5">
        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Info Produk */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Info Produk</h2>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Link produk <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              placeholder="https://amazon.co.jp/dp/..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={form.product_url}
              onChange={e => set('product_url', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Nama produk <span className="text-red-400">*</span>
            </label>
            <input
              placeholder="Contoh: Nintendo Switch OLED"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={form.product_name}
              onChange={e => set('product_name', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Jumlah</label>
            <input
              type="number"
              min={1}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={form.quantity}
              onChange={e => set('quantity', parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        {/* Budget & Deadline */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Budget & Deadline</h2>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Maksimal budget (IDR) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">Rp</span>
              <input
                type="number"
                min={0}
                placeholder="3000000"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={form.max_budget_idr}
                onChange={e => set('max_budget_idr', e.target.value)}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Jastiper akan set harga fix ≤ budget ini. Tagihan langsung muncul begitu jastiper ambil request kamu.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Deadline <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={form.deadline}
              onChange={e => set('deadline', e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">Tanggal terakhir barang harus tiba di kamu</p>
          </div>
        </div>

        {/* Pengiriman */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Pengiriman</h2>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Preferensi pengiriman <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['courier', 'meetup'] as DeliveryPref[]).map(pref => (
                <button
                  key={pref}
                  type="button"
                  onClick={() => set('delivery_pref', pref)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                    form.delivery_pref === pref
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                  }`}
                >
                  {pref === 'courier' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  )}
                  {pref === 'courier' ? 'Courier' : 'Meetup'}
                </button>
              ))}
            </div>
          </div>

          {form.delivery_pref === 'courier' && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Alamat pengiriman <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Jl. Merdeka No. 12, Kel. Kauman, Kec. Klojen, Malang, Jawa Timur 65119"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                value={form.shipping_address}
                onChange={e => set('shipping_address', e.target.value)}
              />
            </div>
          )}

          {form.delivery_pref === 'meetup' && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Lokasi meetup <span className="text-red-400">*</span>
                </label>
                <input
                  placeholder="Contoh: Mall Olympic Garden, Malang"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={form.meetup_location}
                  onChange={e => set('meetup_location', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Waktu meetup <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={form.meetup_time}
                  onChange={e => set('meetup_time', e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        {/* Catatan */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-4">Catatan untuk Jastiper</h2>
          <textarea
            rows={3}
            placeholder="Contoh: Tolong pilih warna putih, pastikan ada charger EU plug"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl py-3 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading ? 'Mengirim request...' : 'Kirim Request'}
        </button>

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center pb-6">
          Setelah jastiper mengambil request ini, tagihan akan langsung muncul. Kamu punya 24 jam untuk membayar.
        </p>
      </div>
    </div>
  )
}