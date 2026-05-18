'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type DisbursementItem = {
  order_id: string
  product_name: string
  created_at: string
  jastiper: {
    id: string
    full_name: string
    bank_name: string | null
    bank_account: string | null
    whatsapp_number: string | null
  } | null
  buyer: {
    full_name: string
  } | null
  pricing: {
    total_idr: number
    platform_fee_idr: number
    disbursement_amount: number
  } | null
  escrow: {
    id: string
    admin_note: string | null
    is_disbursed: boolean
  } | null
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminDisbursementsPage() {
  const supabase = createClient()
  const router = useRouter()

  const [items, setItems] = useState<DisbursementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending' | 'disbursed'>('pending')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const [selected, setSelected] = useState<DisbursementItem | null>(null)

  useEffect(() => {
    fetchDisbursements()
  }, [])

  async function fetchDisbursements() {
    setLoading(true)

    // Fetch delivered orders
    const { data: ordersData } = await supabase
      .from('orders')
      .select('id, product_name, created_at, buyer_id, jastiper_id, order_pricing(total_idr, platform_fee_idr)')
      .eq('status', 'delivered')
      .order('created_at', { ascending: false })

    if (!ordersData || ordersData.length === 0) {
      setItems([])
      setLoading(false)
      return
    }

    const orderIds = ordersData.map((o: any) => o.id)
    
    // Fetch escrow transactions
    const { data: escrowData } = await supabase
      .from('escrow_transactions')
      .select('id, order_id, admin_note, amount_idr')
      .in('order_id', orderIds)
      
    const escrowMap: Record<string, any> = {}
    ;(escrowData ?? []).forEach((e: any) => {
      escrowMap[e.order_id] = {
        ...e,
        is_disbursed: (e.admin_note || '').includes('[DISBURSED]')
      }
    })

    // Fetch users (buyers and jastipers)
    const userIds = [...new Set([
      ...ordersData.map((o: any) => o.buyer_id),
      ...ordersData.map((o: any) => o.jastiper_id),
    ].filter(Boolean))]

    const { data: usersData } = await supabase
      .from('users')
      .select('id, full_name')
      .in('id', userIds)

    const userMap: Record<string, any> = {}
    ;(usersData ?? []).forEach((u: any) => { userMap[u.id] = u })

    // Fetch jastiper profiles for bank info
    const jastiperIds = [...new Set(ordersData.map((o: any) => o.jastiper_id).filter(Boolean))]
    const { data: jpData } = await supabase
      .from('jastiper_profiles')
      .select('user_id, bank_name, bank_account, whatsapp_number')
      .in('user_id', jastiperIds)

    const jpMap: Record<string, any> = {}
    ;(jpData ?? []).forEach((jp: any) => { jpMap[jp.user_id] = jp })

    // Map everything
    const mapped: DisbursementItem[] = ordersData.map((o: any) => {
      const escrow = escrowMap[o.id]
      const total = escrow?.amount_idr ?? 0
      const fee = Math.round(total - (total / 1.05))

      return {
        order_id: o.id,
        product_name: o.product_name,
        created_at: o.created_at,
        jastiper: o.jastiper_id ? {
          id: o.jastiper_id,
          full_name: userMap[o.jastiper_id]?.full_name ?? '-',
          bank_name: jpMap[o.jastiper_id]?.bank_name ?? null,
          bank_account: jpMap[o.jastiper_id]?.bank_account ?? null,
          whatsapp_number: jpMap[o.jastiper_id]?.whatsapp_number ?? null,
        } : null,
        buyer: o.buyer_id ? {
          full_name: userMap[o.buyer_id]?.full_name ?? '-',
        } : null,
        pricing: {
          total_idr: total,
          platform_fee_idr: fee,
          disbursement_amount: total - fee,
        },
        escrow: escrow ?? null
      }
    })

    setItems(mapped)
    setLoading(false)
  }

  async function handleDisburse(item: DisbursementItem) {
    if (!item.escrow) return
    setActionLoadingId(item.escrow.id)

    const currentDate = new Date().toISOString()
    const newNote = item.escrow.admin_note 
      ? `${item.escrow.admin_note}\n[DISBURSED] pada ${currentDate}`
      : `[DISBURSED] pada ${currentDate}`

    await supabase
      .from('escrow_transactions')
      .update({ admin_note: newNote })
      .eq('id', item.escrow.id)

    setSuccess(`Dana untuk order ${item.product_name} berhasil ditandai sebagai dicairkan!`)
    setActionLoadingId(null)
    setSelected(null)
    fetchDisbursements()
  }

  const filteredItems = items.filter(item => 
    tab === 'pending' ? !item.escrow?.is_disbursed : item.escrow?.is_disbursed
  )

  const pendingCount = items.filter(item => !item.escrow?.is_disbursed).length

  return (
    <div className="py-6 min-h-screen">
      {/* Modal Detail */}
      {selected && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelected(null)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            
            <h2 className="text-xl font-bold text-gray-900 mb-4">Detail Pencairan</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Order</p>
                <p className="font-semibold text-gray-900">{selected.product_name}</p>
                <p className="text-xs text-gray-400">{selected.order_id}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Buyer</p>
                  <p className="font-medium text-gray-900">{selected.buyer?.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Jastiper</p>
                  <p className="font-medium text-gray-900">{selected.jastiper?.full_name}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Informasi Rekening Jastiper</p>
                {selected.jastiper?.bank_name && selected.jastiper?.bank_account ? (
                  <>
                    <p className="font-medium text-gray-900">{selected.jastiper.bank_name}</p>
                    <p className="text-lg font-mono text-gray-700 tracking-wider my-1">{selected.jastiper.bank_account}</p>
                    <p className="text-sm text-gray-500">A.n. {selected.jastiper.full_name}</p>
                  </>
                ) : (
                  <p className="text-sm text-red-500">Jastiper belum mengisi data rekening bank.</p>
                )}
                
                {selected.jastiper?.whatsapp_number && (
                  <a 
                    href={`https://wa.me/${selected.jastiper.whatsapp_number.replace(/[^0-9]/g, '')}`} 
                    target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-sm text-teal-600 hover:text-teal-700 font-medium"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    Hubungi Jastiper
                  </a>
                )}
              </div>

              <div className="space-y-2 text-sm pt-2 border-t border-gray-100">
                <div className="flex justify-between text-gray-500">
                  <span>Total Dibayar Buyer</span>
                  <span>{formatRupiah(selected.pricing?.total_idr || 0)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Platform Fee (Jastipal)</span>
                  <span className="text-red-500">- {formatRupiah(selected.pricing?.platform_fee_idr || 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-lg pt-2">
                  <span>Nominal Pencairan</span>
                  <span className="text-teal-600">{formatRupiah(selected.pricing?.disbursement_amount || 0)}</span>
                </div>
              </div>

              {!selected.escrow?.is_disbursed && (
                <button
                  onClick={() => handleDisburse(selected)}
                  disabled={actionLoadingId === selected.escrow?.id || (!selected.jastiper?.bank_name)}
                  className="w-full mt-4 bg-[#14B8A6] text-white font-semibold py-3 rounded-xl hover:bg-teal-600 disabled:opacity-50 transition"
                >
                  {actionLoadingId === selected.escrow?.id ? 'Memproses...' : 'Tandai Sudah Dicairkan'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold text-[#0F172A]">Pencairan Dana</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola dan transfer dana ke jastiper untuk order yang sudah selesai</p>
      </div>

      {/* Success Toast */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-green-700 font-medium">{success}</p>
          <button onClick={() => setSuccess('')} className="text-green-500 ml-4 hover:text-green-700">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-6 border-b border-[#E2E8F0] mb-6">
        <button
          onClick={() => setTab('pending')}
          className={`relative pb-3 font-medium text-sm transition-colors ${
            tab === 'pending' ? 'text-[#14B8A6]' : 'text-[#64748B] hover:text-gray-800'
          }`}
        >
          Menunggu Pencairan 
          {pendingCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              {pendingCount}
            </span>
          )}
          {tab === 'pending' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#14B8A6]" />}
        </button>
        <button
          onClick={() => setTab('disbursed')}
          className={`relative pb-3 font-medium text-sm transition-colors ${
            tab === 'disbursed' ? 'text-[#14B8A6]' : 'text-[#64748B] hover:text-gray-800'
          }`}
        >
          Sudah Dicairkan
          {tab === 'disbursed' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#14B8A6]" />}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-teal-600 rounded-full animate-spin" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <p className="text-sm text-[#64748B]">
            {tab === 'pending' 
              ? 'Tidak ada order selesai yang menunggu pencairan dana.' 
              : 'Belum ada riwayat dana yang dicairkan.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div 
              key={item.order_id} 
              className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden hover:border-teal-300 hover:shadow-md transition duration-200 cursor-pointer flex flex-col"
              onClick={() => setSelected(item)}
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 line-clamp-2">{item.product_name}</h3>
                    <p className="text-xs text-gray-400 mt-1">Selesai: {formatDate(item.created_at)}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 text-sm mt-3 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Jastiper</span>
                    <span className="font-semibold text-gray-900">{item.jastiper?.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bank</span>
                    <span className="font-medium text-gray-900 text-right">
                      {item.jastiper?.bank_name ? `${item.jastiper.bank_name}` : <span className="text-red-500 text-xs">Belum diatur</span>}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Nominal Cair</p>
                    <p className="text-lg font-bold text-teal-600">
                      {formatRupiah(item.pricing?.disbursement_amount || 0)}
                    </p>
                  </div>
                </div>
              </div>
              
              {tab === 'pending' && (
                <div className="bg-orange-50 px-5 py-3 border-t border-orange-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-orange-600 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                    Perlu Dicairkan
                  </span>
                  <span className="text-xs font-medium text-orange-600">Klik untuk bayar &rarr;</span>
                </div>
              )}
              {tab === 'disbursed' && (
                <div className="bg-green-50 px-5 py-3 border-t border-green-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-green-600 flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Sudah Dicairkan
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
