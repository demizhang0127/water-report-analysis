import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export const runtime = 'edge';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://water-report-analysis.xjypro.com';
  const response = NextResponse.redirect(`${baseUrl}/`);
  response.headers.set('Set-Cookie', clearSessionCookie());
  return response;
}
