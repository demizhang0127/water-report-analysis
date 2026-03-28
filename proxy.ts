import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export const config = {
  matcher: ['/', '/api/analyze'],
};

export async function proxy(request: NextRequest) {
  // Let auth routes through
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const session = await getSession(request);
  if (!session) {
    const loginUrl = new URL('/api/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
