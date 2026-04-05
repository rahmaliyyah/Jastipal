import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // wajib dipanggil di middleware untuk refresh session
  const { data: { user } } = await supabase.auth.getUser()

  const isPublicRoute = ['/login', '/register'].includes(pathname)
  const isAuthCallback = pathname.startsWith('/auth/callback')

  // belum login → ke login (kecuali halaman publik dan callback)
  if (!user && !isPublicRoute && !isAuthCallback) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // sudah login → jangan bisa akses halaman publik
  if (user && isPublicRoute) {
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (userData?.is_admin) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // halaman admin → hanya is_admin = true yang boleh masuk
  if (pathname.startsWith('/admin')) {
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user!.id)
      .single()

    if (!userData?.is_admin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}