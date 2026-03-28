import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://water-report-analysis.xjypro.com';
  const redirectUri = `${baseUrl}/api/auth/callback`;

  // Generate random state for CSRF protection
  const stateBytes = crypto.getRandomValues(new Uint8Array(16));
  const state = Array.from(stateBytes).map(b => b.toString(16).padStart(2, '0')).join('');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  const response = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  response.headers.set(
    'Set-Cookie',
    `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`
  );
  return response;
}
