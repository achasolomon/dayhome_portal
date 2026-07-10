import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function getDashboardPath(role: string, orgType?: string): string {
  if (orgType === 'system') return '/admin/dashboard';
  if (orgType === 'dayhome') return '/dayhome/dashboard';
  if (orgType === 'parent') return '/parent/dashboard';
  if (['SUPER_ADMIN', 'ORG_ADMIN', 'ORG_MANAGER', 'BILLING_ONLY'].includes(role)) {
    return '/admin/dashboard';
  }
  if (['DAYHOME_OWNER', 'EDUCATOR'].includes(role)) return '/dayhome/dashboard';
  return '/parent/dashboard';
}

function isAuthorized(pathname: string, role: string, orgType?: string): boolean {
  if (pathname.startsWith('/admin')) {
    if (orgType === 'dayhome' || orgType === 'parent') return false;
    return ['SUPER_ADMIN', 'ORG_ADMIN', 'ORG_MANAGER', 'BILLING_ONLY', 'GOVERNMENT'].includes(role);
  }
  if (pathname.startsWith('/dayhome')) {
    if (orgType === 'system' || orgType === 'parent') return false;
    return ['DAYHOME_OWNER', 'EDUCATOR'].includes(role);
  }
  if (pathname.startsWith('/parent')) {
    if (orgType === 'system' || orgType === 'dayhome') return false;
    return role === 'PARENT';
  }
  return true;
}

export function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token');
  const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  if (!refreshToken && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (refreshToken && isPublicPath) {
    const payload = decodeJwt(refreshToken.value);
    const role = (payload?.role as string) ?? 'PARENT';
    const orgType = payload?.orgType as string | undefined;
    return NextResponse.redirect(new URL(getDashboardPath(role, orgType), request.url));
  }

  if (refreshToken) {
    const payload = decodeJwt(refreshToken.value);
    const role = (payload?.role as string) ?? '';
    const orgType = payload?.orgType as string | undefined;

    if (!isAuthorized(request.nextUrl.pathname, role, orgType)) {
      return NextResponse.redirect(new URL(getDashboardPath(role, orgType), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
