import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ALLOWED_PATHS, GUARDED_PATHS } from '@/lib/routes';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const guarded = GUARDED_PATHS.some((path) => pathname.startsWith(path));

  if (!guarded && !ALLOWED_PATHS.includes(pathname as (typeof ALLOWED_PATHS)[number])) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  const nameCookie = request.cookies.get('pomodoro_name')?.value;
  if (!nameCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
