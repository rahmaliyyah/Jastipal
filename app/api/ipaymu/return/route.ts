import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')
  const status = searchParams.get('status')

  if (!orderId) {
    return NextResponse.redirect(new URL('/orders?error=MissingOrderId', request.url))
  }

  // Jika pembayaran berhasil (atau simulasi lokal iPaymu return)
  if (status === 'berhasil') {
    const supabase = await createClient()

    // 1. Perbarui status order menjadi 'processing' (Diproses Jastiper)
    const { error: orderError } = await supabase
      .from('orders')
      .update({ status: 'processing' })
      .eq('id', orderId)

    if (orderError) {
      console.error('Failed to update order status:', orderError)
      return NextResponse.redirect(new URL('/orders?error=FailedUpdateOrder', request.url))
    }

    // 2. Perbarui escrow_transactions seolah-olah sudah disetujui (seperti klik Approve di Admin)
    const { error: escrowError } = await supabase
      .from('escrow_transactions')
      .update({
        status: 'released', // Sesuai dengan logika "Disetujui" admin saat ini
        payment_method: 'iPaymu',
        paid_at: new Date().toISOString(),
        released_at: new Date().toISOString()
      })
      .eq('order_id', orderId)

    if (escrowError) {
      console.error('Failed to update escrow transaction:', escrowError)
      return NextResponse.redirect(new URL('/orders?error=FailedUpdateEscrow', request.url))
    }

    // Redirect kembali ke halaman orders dengan pesan sukses
    return NextResponse.redirect(new URL('/orders?success=Pembayaran iPaymu Berhasil!', request.url))
  }

  // Jika dibatalkan atau gagal
  return NextResponse.redirect(new URL('/orders', request.url))
}
