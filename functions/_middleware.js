// Cloudflare Pages Functions Middleware
// This file runs at the Cloudflare edge layer, before Next.js

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Allow auth routes through without checking
  if (pathname.startsWith('/api/auth/')) {
    return next();
  }

  // Allow static assets through
  if (pathname.startsWith('/_next/') || pathname.startsWith('/favicon')) {
    return next();
  }

  // Check for session cookie
  const cookie = request.headers.get('cookie') || '';
  const hasSession = cookie.includes('auth_session=');

  if (!hasSession) {
    // Redirect to login
    return Response.redirect(new URL('/api/auth/login', request.url), 302);
  }

  return next();
}
