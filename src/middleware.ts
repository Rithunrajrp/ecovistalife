import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Portal routes that require authentication
const PORTAL_PUBLIC_ROUTES = ['/login', '/accept-invite'];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;

  // ============================================
  // PORTAL SUBDOMAIN (portal.example.com or portal.localhost:3000)
  // ============================================
  if (hostname.startsWith('portal.')) {
    // Refresh session and get user
    const { supabaseResponse, user, supabase } = await updateSession(request);

    // Rewrite to /portal routes internally
    const isPortalRoute = pathname.startsWith('/portal');
    const targetPath = isPortalRoute ? pathname : `/portal${pathname === '/' ? '' : pathname}`;

    // Check if this is a public route (login, accept-invite)
    const isPublicRoute = PORTAL_PUBLIC_ROUTES.some(route =>
      pathname === route || pathname.startsWith(route)
    );

    // If not authenticated and trying to access protected route
    if (!user && !isPublicRoute) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If authenticated, verify user is a portal user (has profile)
    if (user && !isPublicRoute) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role, is_active')
        .eq('id', user.id)
        .single();

      // If user doesn't have a profile or is inactive, sign out
      if (!profile || !profile.is_active) {
        await supabase.auth.signOut();
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(loginUrl);
      }

      // Add role to request headers for downstream use
      supabaseResponse.headers.set('x-user-role', profile.role);
    }

    // If authenticated and trying to access login page, redirect to dashboard
    if (user && isPublicRoute && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Rewrite to /portal routes
    if (!isPortalRoute) {
      url.pathname = targetPath;
      const rewriteResponse = NextResponse.rewrite(url, {
        headers: supabaseResponse.headers,
      });
      // Copy cookies from session refresh
      supabaseResponse.cookies.getAll().forEach(cookie => {
        rewriteResponse.cookies.set(cookie);
      });
      // Tell the portal layout whether this is a public route so it can
      // skip the getSession() auth-gate (avoids the 307 redirect loop).
      rewriteResponse.headers.set('x-is-public-route', isPublicRoute ? '1' : '0');
      return rewriteResponse;
    }

    // Already a /portal/* path — just return the supabase response
    supabaseResponse.headers.set('x-is-public-route', isPublicRoute ? '1' : '0');
    return supabaseResponse;
  }

  // ============================================
  // ADMIN SUBDOMAIN (admin.example.com)
  // ============================================
  if (hostname.startsWith('admin.')) {
    // Refresh session for admin area too
    const { supabaseResponse, user } = await updateSession(request);

    // Rewrite the URL to point to the /admin folder internally
    if (!pathname.startsWith('/admin')) {
      url.pathname = `/admin${pathname === '/' ? '' : pathname}`;

      const rewriteResponse = NextResponse.rewrite(url, {
        headers: supabaseResponse.headers,
      });
      supabaseResponse.cookies.getAll().forEach(cookie => {
        rewriteResponse.cookies.set(cookie);
      });
      return rewriteResponse;
    }

    return supabaseResponse;
  }

  // ============================================
  // DEFAULT (main website)
  // ============================================
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
