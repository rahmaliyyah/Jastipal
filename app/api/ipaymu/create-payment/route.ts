import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await request.json()
    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, product_name, buyer_id')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if the user is the buyer
    if (order.buyer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch pricing
    const { data: pricing, error: pricingError } = await supabase
      .from('order_pricing')
      .select('total_idr')
      .eq('order_id', orderId)
      .single()

    if (pricingError || !pricing) {
      return NextResponse.json({ error: 'Order pricing not found' }, { status: 404 })
    }

    // Fetch user details for buyer data
    const { data: userData } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const va = process.env.IPAYMU_VA
    const apiKey = process.env.IPAYMU_API_KEY

    if (!va || !apiKey) {
      return NextResponse.json({ error: 'Server misconfiguration: missing iPaymu credentials' }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Build payload for iPaymu
    const reqBody = {
      product: [order.product_name],
      qty: ['1'],
      price: [pricing.total_idr.toString()],
      returnUrl: `${baseUrl}/api/ipaymu/return?orderId=${order.id}`,
      cancelUrl: `${baseUrl}/orders`,
      notifyUrl: `${baseUrl}/api/ipaymu/notify`, // optional endpoint (not implemented, since manual flow is kept)
      referenceId: order.id,
      buyerName: userData?.full_name || 'Buyer',
      buyerEmail: user.email || '',
      buyerPhone: '08123456789' // Default/dummy if not available
    }

    const jsonBody = JSON.stringify(reqBody)

    // Generate Signature
    const signatureBody = crypto.createHash('sha256').update(jsonBody).digest('hex').toLowerCase()
    const stringToSign = `POST:${va}:${signatureBody}:${apiKey}`
    const signature = crypto.createHmac('sha256', apiKey).update(stringToSign).digest('hex').toLowerCase()

    // Generate Timestamp (YYYYMMDDhhmmss)
    const now = new Date()
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`

    const response = await fetch('https://sandbox.ipaymu.com/api/v2/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'signature': signature,
        'va': va,
        'timestamp': timestamp
      },
      body: jsonBody
    })

    const responseData = await response.json()

    if (responseData.Status === 200 && responseData.Data && responseData.Data.Url) {
      return NextResponse.json({ url: responseData.Data.Url })
    } else {
      console.error('iPaymu Error:', responseData)
      return NextResponse.json({ error: responseData.Message || 'Failed to generate payment link' }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Create Payment Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
