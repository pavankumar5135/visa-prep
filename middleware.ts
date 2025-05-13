import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './app/utils/supabase/middleware'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // First, handle normal session refreshing
  const response = await updateSession(request)
  
  // Check if there's a token in the URL
  const { searchParams, pathname } = new URL(request.url)
  const token = searchParams.get('token')
  
  // If token exists, redirect to a special route that will handle it
  if (token && (pathname === '/dashboard' || pathname === '/visa-prep/dashboard' || pathname === '/healthcare-interviews/dashboard')) {
    const url = new URL('/auth/token', request.url)
    url.searchParams.set('token', token)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
  
  // Only check authentication for interview paths
  if (pathname.startsWith('/interview') || 
      pathname.startsWith('/visa-prep/interview') || 
      pathname.startsWith('/healthcare-interviews/interview')) {
    // Create a server client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const cookie = await request.cookies.get(name)
            return cookie?.value
          },
          async set(name: string, value: string, options: CookieOptions) {
            await request.cookies.set({
              name,
              value,
              ...options,
            })
          },
          async remove(name: string, options: CookieOptions) {
            await request.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    
    // If not authenticated, redirect to the appropriate dashboard with an error message
    if (!session) {
      // Determine the redirect URL based on the requested path
      let dashboardUrl;
      if (pathname.startsWith('/visa-prep/')) {
        dashboardUrl = new URL('/visa-prep/dashboard', request.url);
      } else if (pathname.startsWith('/healthcare-interviews/')) {
        dashboardUrl = new URL('/healthcare-interviews/dashboard', request.url);
      } else {
        dashboardUrl = new URL('/dashboard', request.url);
      }
      
      dashboardUrl.searchParams.set('auth_error', 'You must be logged in to access the interview page')
      
      // Redirect to the dashboard with the error parameter
      return NextResponse.redirect(dashboardUrl)
    }
  }
  
  // User is authenticated or not accessing protected route, allow the request to proceed
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 