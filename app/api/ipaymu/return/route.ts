import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')
  const status = searchParams.get('status')

  if (!orderId) {
    return NextResponse.redirect(new URL('/orders?error=MissingOrderId', request.url))
  }

  if (status === 'berhasil') {
    const supabase = await createClient()

    const { error: orderError } = await supabase
      .from('orders')
      .update({ status: 'processing' })
      .eq('id', orderId)

    if (orderError) {
      console.error('Failed to update order status:', orderError)
      return NextResponse.redirect(new URL('/orders?error=FailedUpdateOrder', request.url))
    }

    const { error: escrowError } = await supabase
      .from('escrow_transactions')
      .update({
        status: 'released', 
        payment_method: 'iPaymu',
        paid_at: new Date().toISOString(),
        released_at: new Date().toISOString()
      })
      .eq('order_id', orderId)

    if (escrowError) {
      console.error('Failed to update escrow transaction:', escrowError)
      return NextResponse.redirect(new URL('/orders?error=FailedUpdateEscrow', request.url))
    }

    return NextResponse.redirect(new URL('/orders?success=Pembayaran iPaymu Berhasil!', request.url))
  }

  return NextResponse.redirect(new URL('/orders', request.url))
}
