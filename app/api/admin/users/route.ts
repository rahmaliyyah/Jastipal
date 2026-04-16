import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? ''

  let query = supabaseAdmin
    .from('users')
    .select('id, full_name, email, avatar_url, is_jastiper, is_frozen, is_admin, active_role, created_at')
    .order('created_at', { ascending: false })

  if (q.trim()) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const { target_user_id, action, reason, admin_id } = body

  const is_frozen = action === 'freeze'

  await supabaseAdmin
    .from('users')
    .update({ is_frozen })
    .eq('id', target_user_id)

  await supabaseAdmin
    .from('admin_actions')
    .insert({
      admin_id,
      target_user_id,
      action_type: action,
      reason,
    })

  return NextResponse.json({ success: true })
}