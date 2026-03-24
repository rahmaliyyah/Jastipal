import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Cek apakah user sudah ada di tabel users
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single()

      // Kalau belum ada, insert dulu (user baru via Google)
      if (!existingUser) {
        await supabase.from('users').insert({
          id: data.user.id,
          full_name: data.user.user_metadata.full_name ?? 'User',
          role: 'user' // default role, bisa diubah nanti
        })
      }

      // Redirect sesuai role
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (userData?.role === 'jastiper') {
        return NextResponse.redirect(`${origin}/jastiper/requests`)
      }
      return NextResponse.redirect(`${origin}/browse`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}