import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // client pakai anon key untuk auth session
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

  // client pakai service role key untuk bypass RLS saat baca is_admin/is_frozen
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
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

  const { data: { user } } = await supabase.auth.getUser()

  const isPublicRoute = ['/login', '/register'].includes(pathname)
  const isAuthCallback = pathname.startsWith('/auth/callback')

  // belum login → ke login
  if (!user && !isPublicRoute && !isAuthCallback) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    // pakai service role untuk bypass RLS
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('is_admin, is_frozen')
      .eq('id', user.id)
      .single()

    // user difreeze → paksa logout dan redirect ke login
    if (userData?.is_frozen) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login?error=frozen', request.url))
    }

    // sudah login → jangan bisa akses halaman publik
    if (isPublicRoute) {
      if (userData?.is_admin) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // halaman admin → hanya is_admin = true
    if (pathname.startsWith('/admin') && !userData?.is_admin) {
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