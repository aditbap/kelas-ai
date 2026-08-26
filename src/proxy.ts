import { getSessionCookie } from 'better-auth/cookies';
import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PREFIXES = ['/student', '/editor'];

/**
 * Coarse gate: is there a session cookie at all? This does not verify the
 * session against the database (that would mean a DB round-trip on every
 * request/asset) - it only keeps signed-out visitors from ever reaching a
 * protected route. The specific role each dashboard requires is enforced in
 * that dashboard's own layout via `requireRole` (src/lib/session.ts), which
 * does check the database.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!isProtected) return NextResponse.next();

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/student/:path*', '/editor/:path*'],
};
