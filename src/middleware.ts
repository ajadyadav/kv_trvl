import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { user, supabaseResponse } = await updateSession(request);

  const path = request.nextUrl.pathname;

  // Protect specific routes (e.g. profile, bookings, hotel/flight booking pages)
  const isProtectedRoute =
    path.startsWith('/profile') ||
    path.startsWith('/bookings') ||
    path.match(/^\/[^/]+\/book\/.+/) !== null || // e.g. /hotels/book/offerId or /flights/book/offerId
    path.startsWith('/booking/confirmation');

  if (isProtectedRoute && !user) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', path + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users trying to access login/signup
  const isAuthRoute = path === '/login' || path === '/signup';
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
