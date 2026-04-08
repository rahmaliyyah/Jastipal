import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login`)
  }

  // cek apakah user sudah ada di public.users
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, is_admin, is_frozen')
    .eq('id', data.user.id)
    .single()

  // user difreeze → langsung logout dan redirect ke login dengan pesan
  if (existingUser?.is_frozen) {
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login?error=frozen`)
  }

  // user baru via Google → insert sebagai buyer
  if (!existingUser) {
    await supabase.from('users').insert({
      id: data.user.id,
      full_name: data.user.user_metadata.full_name ?? data.user.email ?? 'User',
      email: data.user.email,
      auth_provider: 'google',
      is_jastiper: false,
      is_admin: false,
      is_frozen: false,
    })
    return NextResponse.redirect(`${origin}/dashboard`)
  }

  // user lama → redirect sesuai role
  if (existingUser.is_admin) {
    return NextResponse.redirect(`${origin}/admin`)
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}