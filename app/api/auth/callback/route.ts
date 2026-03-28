import { NextRequest, NextResponse } from 'next/server';
import { signJWT, createSessionCookie } from '@/lib/auth';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://water-report-analysis.xjypro.com';
  const errorRedirect = NextResponse.redirect(`${baseUrl}/?error=auth_failed`);

  // CSRF check
  const cookieHeader = request.headers.get('cookie') || '';
  const storedStateMatch = cookieHeader.match(/(?:^|;\s*)oauth_state=([^;]+)/);
  const storedState = storedStateMatch?.[1];

  if (!code || !state || !storedState || state !== storedState) {
    return errorRedirect;
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${baseUrl}/api/auth/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json() as { access_token?: string; error?: string };
    if (!tokens.access_token) return errorRedirect;

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const user = await userRes.json() as { sub: string; email: string; name: string; picture: string };

    // Create session JWT
    const jwt = await signJWT(
      { sub: user.sub, email: user.email, name: user.name, picture: user.picture },
      process.env.AUTH_SECRET!
    );

    const response = NextResponse.redirect(`${baseUrl}/`);
    response.headers.set('Set-Cookie', createSessionCookie(jwt));
    // Clear oauth_state cookie
    response.headers.append(
      'Set-Cookie',
      'oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'
    );
    return response;
  } catch {
    return errorRedirect;
  }
}
