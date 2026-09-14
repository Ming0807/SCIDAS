import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const pathname = request.nextUrl.pathname

  // Allow public static metadata routes and health check
  if (
    pathname === '/manifest.webmanifest' ||
    pathname === '/manifest.json' ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.startsWith('/api/health')
  ) {
    return supabaseResponse
  }

  // Refresh user auth token safely
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Guard: If this is a Server Action request (has next-action header),
  // NEVER redirect with HTML to avoid "An unexpected response was received from the server".
  // The server action handler itself enforces role and authorization checks.
  const isServerAction = request.headers.has('next-action')
  if (isServerAction) {
    return supabaseResponse
  }

  // Protect dashboard and core routes
  if (
    !user &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in, check roles and permissions
  if (user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/auth')) {
    try {
      // Check if user is staff (exists in profiles)
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .maybeSingle()

      let isStudent = false

      if (!profile) {
        // If not staff, check if user is a student
        const { data: student } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()

        if (student) {
          isStudent = true
        }
      }

      if (isStudent) {
        // Protect staff-only routes from students
        const restrictedRoutes = [
          '/academics',
          '/attendance',
          '/behavior',
          '/support',
          '/students',
          '/risk-analysis',
          '/development-plans',
          '/home-visits'
        ]

        const path = request.nextUrl.pathname
        const isRestricted = restrictedRoutes.some((route) => path.startsWith(route))

        if (isRestricted) {
          const url = request.nextUrl.clone()
          url.pathname = '/'
          return NextResponse.redirect(url)
        }
      }
    } catch {
      // If DB check fails in proxy, do not crash; continue with supabaseResponse
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.webmanifest (PWA manifest)
     * - static image/asset extensions
     */
    '/((?!_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest)$).*)',
  ],
}
