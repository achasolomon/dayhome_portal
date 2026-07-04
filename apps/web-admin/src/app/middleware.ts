import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token');
  const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  if (!refreshToken && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (refreshToken && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
