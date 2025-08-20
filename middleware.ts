import { NextResponse, NextRequest } from 'next/server'
import { verifySessionToken } from './lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes except the login page
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const token = request.cookies.get('admin_session')?.value
    const valid = token ? await verifySessionToken(token) : null
    if (!valid) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
  }

  // If already authenticated and trying to access login page, redirect to dashboard
  if (pathname === '/admin') {
    const token = request.cookies.get('admin_session')?.value
    const valid = token ? await verifySessionToken(token) : null
    if (valid) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}


