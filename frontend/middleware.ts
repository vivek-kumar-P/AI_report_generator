import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Check if user has session token (NextAuth JWT cookie)
  const sessionToken = 
    req.cookies.get('next-auth.session-token') || 
    req.cookies.get('__Secure-next-auth.session-token')
  
  const isLoggedIn = !!sessionToken

  // Protected routes - only these specific routes
  const protectedRoutes = ['/export', '/dashboard']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Don't redirect from login/signup to prevent loops
  // Users can access these pages regardless of auth status

  return NextResponse.next()
}

export const config = {
  matcher: ['/export/:path*', '/dashboard/:path*'],
}
