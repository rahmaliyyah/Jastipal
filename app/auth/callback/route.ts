import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', data.user.id)
        .single()

      // User baru via Google → belum ada di tabel
      if (!existingUser) {
        await supabase.from('users').insert({
          id: data.user.id,
          full_name: data.user.user_metadata.full_name ?? data.user.email ?? 'User',
          role: null,
        })
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      // User lama tapi belum pilih role
      if (!existingUser.role) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      // User lama sudah punya role
      if (existingUser.role === 'jastiper') {
        return NextResponse.redirect(`${origin}/jastiper/requests`)
      }
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}