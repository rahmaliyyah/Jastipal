'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Request = {
  id: string
  buyer_id: string
  product_name: string
  product_url: string
  quantity: number
  max_budget_idr: number
  deadline: string
  delivery_pref: 'courier' | 'meetup'
  shipping_address: string | null
  meetup_location: string | null
  meetup_time: string | null
  notes: string | null
  created_at: string
  users: {
    full_name: string
    avatar_url: string | null
  }
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function formatRupiahPlain(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysLeft(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now()
  const days = Math.ceil(diff / 1000 / 60 / 60 / 24)
  if (days < 0) return { label: 'Kadaluarsa', urgent: true }
  if (days === 0) return { label: 'Hari ini', urgent: true }
  if (days === 1) return { label: '1 hari lagi', urgent: true }
  return { label: `${days} hari lagi`, urgent: days <= 3 }
}

function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}
function IconX({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}
function IconInfo({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  )
}
function IconMapPin() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  )
}
function IconCheckCircle() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  )
}
function IconAlertTriangle() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
}

export default function BrowseRequestsPage() {
  const supabase = createClient()
  const router = useRouter()

  const [requests, setRequests] = useState<Request[]>([])
  const [allRequests, setAllRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Request | null>(null)
  const [fixedPrice, setFixedPrice] = useState('')
  const [takingLoading, setTakingLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userId, setUserId] = useState('')
  const [search, setSearch] = useState('')
  const [filterDelivery, setFilterDelivery] = useState<'all' | 'courier' | 'meetup'>('all')
  const [filterDeadline, setFilterDeadline] = useState<'all' | 'urgent' | 'week'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'budget_high' | 'deadline_soon'>('newest')

  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [showValidationPopup, setShowValidationPopup] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: userData } = await supabase
        .from('users')
        .select('is_jastiper, active_role')
        .eq('id', user.id)
        .single()

      if (!userData?.is_jastiper || userData.active_role !== 'jastiper') {
        router.push('/dashboard')
        return
      }

      fetchRequests()
    }
    init()
  }, [])

  async function fetchRequests() {
    setLoading(true)
    const { data } = await supabase
      .from('requests')
      .select('id, buyer_id, product_name, product_url, quantity, max_budget_idr, deadline, delivery_pref, shipping_address, meetup_location, meetup_time, notes, created_at, users!requests_buyer_id_fkey(full_name, avatar_url)')
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    setAllRequests((data as any) ?? [])
    setRequests((data as any) ?? [])
    setLoading(false)
  }

  async function handleTakeRequest() {
    if (!fixedPrice) { setError('Harga fix wajib diisi'); return }

    const price = parseFloat(fixedPrice.replace(/\./g, '').replace(/,/g, ''))
    if (isNaN(price) || price <= 0) { setError('Harga tidak valid'); return }
    if (price > selected!.max_budget_idr) {
      setError(`Harga fix tidak boleh melebihi max budget buyer (${formatRupiah(selected!.max_budget_idr)})`)
      return
    }

    setTakingLoading(true)
    setError('')

    const paymentExpiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const { error: reqError } = await supabase.from('requests').update({
      jastiper_id: userId,
      fixed_price_idr: price,
      status: 'matched',
      payment_expired_at: paymentExpiredAt,
    }).eq('id', selected!.id)

    if (reqError) { setError('Gagal mengambil request: ' + reqError.message); setTakingLoading(false); return }

    const orderPayload: any = {
      buyer_id: selected!.buyer_id,
      jastiper_id: userId,
      request_id: selected!.id,
      flow_type: 'flow_a',
      product_url: selected!.product_url,
      product_name: selected!.product_name,
      quantity: selected!.quantity,
      delivery_pref: selected!.delivery_pref,
      notes: selected!.notes,
      status: 'waiting_payment',
    }

    if (selected!.delivery_pref === 'courier') {
      orderPayload.shipping_address = selected!.shipping_address
    } else {
      orderPayload.meetup_location = selected!.meetup_location
      orderPayload.meetup_time = selected!.meetup_time
    }

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select('id')
      .single()

    if (orderError) { setError('Gagal membuat order: ' + orderError.message); setTakingLoading(false); return }

    const platformFee = Math.round(price * 0.05)
    await supabase.from('order_pricing').insert({
      order_id: orderData.id,
      product_price_idr: price,
      service_fee_idr: 0,
      shipping_fee_idr: 0,
      platform_fee_idr: platformFee,
      estimated_customs_idr: 0,
      total_idr: price + platformFee,
    })

    await supabase.from('escrow_transactions').insert({
      order_id: orderData.id,
      amount_idr: price + platformFee,
      status: 'held',
    })

    setSuccess(`Request berhasil diambil! Tagihan sebesar ${formatRupiah(price + platformFee)} sudah dikirim ke buyer.`)
    setSelected(null)
    setFixedPrice('')
    setTakingLoading(false)
    setShowSuccessPopup(true)
    fetchRequests()
  }

  const numericDealPrice = Number(fixedPrice.replace(/\./g, '').replace(/,/g, '')) || 0
  const platformFee = Math.round(numericDealPrice * 0.05)
  const totalInvoice = numericDealPrice + platformFee

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto px-8 py-2">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1E293B]">Cari Permintaan</h1>
          <p className="mt-1 text-sm text-[#64748B]">Temukan permintaan titip yang bisa kamu ambil</p>
        </div>

        {/* SEARCH */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <IconSearch />
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama produk, URL, atau catatan..."
            className="w-full h-[44px] rounded-xl border border-[#CBD5E1] bg-white pl-12 pr-4 text-sm text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#59D3B4]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <IconX size={16} />
            </button>
          )}
        </div>

        {/* SUCCESS TOAST */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-green-700">{success}</p>
            <button onClick={() => setSuccess('')} className="text-green-500 ml-4">
              <IconX size={16} />
            </button>
          </div>
        )}

        {/* CONTENT */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-[#59D3B4] rounded-full animate-spin"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <IconSearch />
            </div>
            <p className="text-sm text-[#64748B]">Belum ada request yang tersedia</p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map(req => {
              const dl = daysLeft(req.deadline)
              return (
                <div key={req.id} className="bg-white border border-[#CBD5E1] rounded-2xl p-5">

                  {/* Buyer info */}
                  <div className="flex items-center gap-2 mb-3">
                    {req.users?.avatar_url ? (
                      <img src={req.users.avatar_url} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600 uppercase">
                        {req.users?.full_name?.[0] ?? '?'}
                      </div>
                    )}
                    <p className="text-sm text-[#64748B]">{req.users?.full_name}</p>
                    <span className="text-[#CBD5E1]">·</span>
                    <p className="text-xs text-[#94A3B8]">{formatDate(req.created_at)}</p>
                  </div>

                  {/* TITLE */}
                  <h2 className="font-bold text-[#0F172A] mb-2">{req.product_name}</h2>

                  {/* LINK */}
                  <a
                    href={req.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-[#64748B] text-xs break-all hover:underline mb-5"
                  >
                    {req.product_url}
                  </a>

                  {/* GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="bg-[#F8FAFC] rounded-xl p-4">
                      <p className="text-xs text-[#94A3B8] font-medium">Batas Waktu</p>
                      <h3 className={`mt-1 text-sm font-bold ${dl.urgent ? 'text-red-500' : 'text-[#1E293B]'}`}>
                        {formatDate(req.deadline)}
                        {dl.urgent && <span className="text-xs font-normal ml-2">({dl.label})</span>}
                      </h3>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-xl p-4">
                      <p className="text-xs text-[#94A3B8] font-medium">Metode Pengiriman</p>
                      <h3 className="mt-1 text-sm font-bold text-[#1E293B] capitalize">
                        {req.delivery_pref === 'courier' ? 'Kirim Paket' : 'Meetup'}
                      </h3>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-xl p-4">
                      <p className="text-xs text-[#94A3B8] font-medium">Maksimal Budget (IDR)</p>
                      <h3 className="mt-1 text-sm font-bold text-[#1E293B]">Rp {formatRupiahPlain(req.max_budget_idr)}</h3>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-xl p-4">
                      <p className="text-xs text-[#94A3B8] font-medium">Jumlah</p>
                      <h3 className="mt-1 text-sm font-bold text-[#1E293B]">{req.quantity} Pcs</h3>
                    </div>
                  </div>

                  {/* Delivery detail */}
                  {req.delivery_pref === 'courier' && req.shipping_address && (
                    <div className="flex items-start gap-2 text-xs text-[#64748B] mt-4">
                      <IconMapPin />
                      {req.shipping_address}
                    </div>
                  )}
                  {req.delivery_pref === 'meetup' && req.meetup_location && (
                    <div className="flex items-start gap-2 text-xs text-[#64748B] mt-4">
                      <IconMapPin />
                      {req.meetup_location}
                      {req.meetup_time && ` · ${new Date(req.meetup_time).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`}
                    </div>
                  )}

                  {/* NOTE + BUTTON */}
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mt-6">
                    {req.notes ? (
                      <div>
                        <h3 className="text-[18px] font-bold text-[#0F172A]">Catatan:</h3>
                        <p className="mt-2 text-[16px] text-[#64748B] leading-relaxed">{req.notes}</p>
                      </div>
                    ) : <div />}
                    <button
                      onClick={() => { setSelected(req); setFixedPrice(''); setError('') }}
                      className="w-full md:w-auto bg-[#49BC9E] hover:bg-[#1b977f] transition-all text-white font-semibold text-[18px] px-8 py-4 rounded-xl shadow-lg shadow-teal-200"
                    >
                      Ambil Permintaan
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* MODAL AMBIL REQUEST */}
        {selected && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3">
            <div className="w-full max-w-[600px] bg-white rounded-3xl p-5 md:p-6">

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[18px] font-bold text-[#0F172A]">Ambil Permintaan</h2>
                <button onClick={() => { setSelected(null); setFixedPrice(''); setError('') }}>
                  <IconX size={28} />
                </button>
              </div>

              <div className="space-y-3">

                <div className="border border-[#E2E8F0] rounded-2xl px-3 py-2 bg-[#F8FAFC]">
                  <p className="text-[14px] text-[#94A3B8] font-medium">Nama Barang</p>
                  <h3 className="mt-1 text-[16px] font-bold text-[#1E293B]">{selected.product_name}</h3>
                </div>

                <div className="border border-[#E2E8F0] rounded-2xl px-3 py-2 bg-[#F8FAFC]">
                  <p className="text-[14px] text-[#94A3B8] font-medium">Batas Budget</p>
                  <h3 className="mt-1 text-[16px] font-bold text-[#1E293B]">Rp {formatRupiahPlain(selected.max_budget_idr)}</h3>
                </div>

                <div>
                  <label className="text-[14px] font-medium text-[#1E293B]">Masukkan harga deal (IDR)</label>
                  <div className="mt-2 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[16px]">Rp</span>
                    <input
                      type="text"
                      value={fixedPrice}
                      onChange={e => {
                        const rawValue = e.target.value.replace(/\D/g, '')
                        setFixedPrice(rawValue ? Number(rawValue).toLocaleString('id-ID') : '')
                      }}
                      placeholder="Masukkan harga deal"
                      className="w-full h-[42px] rounded-2xl border border-[#CBD5E1] bg-white pl-14 pr-4 text-[18px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#59D3B4]"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-[#64748B]">
                    <IconInfo size={16} />
                    <p className="text-[14px]">Harga tidak boleh melebihi budget pembeli</p>
                  </div>
                </div>

                {numericDealPrice > 0 && (
                  <div className="border border-[#CBD5E1] rounded-2xl p-3">
                    <h3 className="text-[18px] font-bold text-[#0F172A]">Ringkasan Harga</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[16px] text-[#64748B]">Harga (Produk & Fee Jastiper)</p>
                        <p className="text-[16px] font-medium text-[#1E293B]">Rp {formatRupiahPlain(numericDealPrice)}</p>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-[16px] text-[#64748B]">Platform Fee (5%)</p>
                        <p className="text-[16px] font-medium text-[#1E293B]">Rp {formatRupiahPlain(platformFee)}</p>
                      </div>
                    </div>
                    <div className="border-t border-[#E2E8F0] mt-2 pt-2 flex items-center justify-between gap-4">
                      <h3 className="text-[18px] font-bold text-[#0F172A]">Total Tagihan</h3>
                      <h3 className="text-[18px] font-bold text-[#59D3B4]">IDR {formatRupiahPlain(totalInvoice)}</h3>
                    </div>
                  </div>
                )}

                <div className="bg-[#EEF4FF] border border-[#D6E4FF] rounded-2xl p-4 flex items-start gap-3">
                  <IconInfo size={22} className="text-[#1D4ED8] flex-shrink-0 mt-1" />
                  <p className="text-[15px] text-[#1D4ED8] leading-relaxed">
                    Tagihan akan otomatis dikirim ke pembeli setelah request diambil,
                    dan pembayaran harus diselesaikan dalam 24 jam sebelum order dibatalkan otomatis.
                  </p>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex flex-col-reverse md:flex-row justify-end gap-4 pt-2">
                  <button
                    onClick={() => { setSelected(null); setFixedPrice(''); setError('') }}
                    className="w-full md:w-[160px] h-[52px] rounded-2xl border border-[#CBD5E1] text-[#64748B] text-[18px] font-medium hover:bg-gray-50 transition-all"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={() => {
                      if (!numericDealPrice || numericDealPrice > selected.max_budget_idr) {
                        setShowValidationPopup(true)
                        return
                      }
                      handleTakeRequest()
                    }}
                    disabled={takingLoading}
                    className="w-full md:w-[160px] h-[46px] rounded-2xl bg-[#59D3B4] hover:bg-[#4CC2A5] text-white text-[18px] font-semibold shadow-lg shadow-teal-100 transition-all disabled:opacity-50"
                  >
                    {takingLoading ? 'Memproses...' : 'Ambil'}
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>

      {/* SUCCESS POPUP */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-[340px] bg-white rounded-2xl p-5 text-center">
            <div className="w-14 h-14 rounded-full bg-[#DCFCE7] flex items-center justify-center mx-auto">
              <IconCheckCircle />
            </div>
            <h2 className="mt-4 text-[20px] font-bold text-[#0F172A]">Permintaan Berhasil Diambil</h2>
            <p className="mt-2 text-[14px] text-[#64748B] leading-relaxed">
              Tagihan otomatis akan dikirim ke pembeli dan menunggu pembayaran.
            </p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="mt-5 w-full h-[42px] rounded-xl bg-[#59D3B4] hover:bg-[#4CC2A5] text-white font-semibold transition-all"
            >
              Oke
            </button>
          </div>
        </div>
      )}

      {/* VALIDATION POPUP */}
      {showValidationPopup && (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-[320px] bg-white rounded-2xl p-5 text-center">
            <div className="w-14 h-14 rounded-full bg-[#FEE2E2] flex items-center justify-center mx-auto">
              <IconAlertTriangle />
            </div>
            <h2 className="mt-4 text-[18px] font-bold text-[#0F172A]">Harga Deal Tidak Valid</h2>
            <p className="mt-2 text-[14px] text-[#64748B] leading-relaxed">
              Pastikan harga deal sudah diisi dan tidak melebihi budget pembeli.
            </p>
            <button
              onClick={() => setShowValidationPopup(false)}
              className="mt-5 w-full h-[42px] rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold transition-all"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

    </main>
  )
}