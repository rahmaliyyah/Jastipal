import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET — ambil list pengajuan KYC berdasarkan status
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabaseAdmin
    .from('users').select('is_admin').eq('id', user.id).single()
  if (!userData?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? 'pending'

  const { data, error } = await supabaseAdmin
    .from('jastiper_profiles')
    .select('user_id, bio, service_fee_pct, base_country, whatsapp_number, kyc_idcard_url, kyc_selfie_url, kyc_status, kyc_rejection_reason, users!jastiper_profiles_user_id_fkey(full_name, email, avatar_url)')
    .eq('kyc_status', status)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// PATCH — approve atau reject
export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabaseAdmin
    .from('users').select('is_admin').eq('id', user.id).single()
  if (!userData?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { target_user_id, action, rejection_reason } = await request.json()

  if (action === 'approve') {
    await supabaseAdmin.from('jastiper_profiles').update({
      kyc_status: 'approved',
      kyc_reviewed_at: new Date().toISOString(),
      kyc_reviewed_by: user.id,
      kyc_rejection_reason: null,
    }).eq('user_id', target_user_id)

    await supabaseAdmin.from('users').update({ is_jastiper: true }).eq('id', target_user_id)

    await supabaseAdmin.from('admin_actions').insert({
      admin_id: user.id,
      target_user_id,
      action_type: 'approve_jastiper',
      reason: 'KYC dokumen valid',
    })
  } else if (action === 'reject') {
    await supabaseAdmin.from('jastiper_profiles').update({
      kyc_status: 'rejected',
      kyc_reviewed_at: new Date().toISOString(),
      kyc_reviewed_by: user.id,
      kyc_rejection_reason: rejection_reason,
    }).eq('user_id', target_user_id)

    await supabaseAdmin.from('admin_actions').insert({
      admin_id: user.id,
      target_user_id,
      action_type: 'reject_jastiper',
      reason: rejection_reason,
    })
  }

  return NextResponse.json({ success: true })
}