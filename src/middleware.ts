import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/dashboard', '/orders', '/products', '/promocode', '/customers', '/stats', '/payouts', '/reviews', '/discounts', '/settings']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authToken = request.cookies.get('authToken')?.value

  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next()
  }

  const requiresAuth = protectedRoutes.some((route) => pathname.startsWith(route))

  if (requiresAuth && !authToken) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (pathname === '/' && authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
