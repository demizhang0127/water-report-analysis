// Edge-compatible auth utilities using Web Crypto API (no Node.js)

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  picture: string;
  iat: number;
  exp: number;
}

function base64urlEncode(data: Uint8Array): string {
  let str = '';
  for (let i = 0; i < data.length; i++) str += String.fromCharCode(data[i]);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlDecode(str: string): ArrayBuffer {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  const b64 = padded + '='.repeat(padLen);
  const binary = atob(b64);
  const buf = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
  return buf;
}

async function getKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret).buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signJWT(payload: Omit<SessionPayload, 'iat' | 'exp'>, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: SessionPayload = { ...payload, iat: now, exp: now + 60 * 60 * 24 * 7 };

  const enc = new TextEncoder();
  const headerBytes = enc.encode(JSON.stringify(header));
  const payloadBytes = enc.encode(JSON.stringify(fullPayload));
  const headerB64 = base64urlEncode(headerBytes);
  const payloadB64 = base64urlEncode(payloadBytes);
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await getKey(secret);
  const signingInputBytes = enc.encode(signingInput);
  const signature = await crypto.subtle.sign('HMAC', key, signingInputBytes.buffer as ArrayBuffer);
  const sigBytes = new Uint8Array(signature);

  return `${signingInput}.${base64urlEncode(sigBytes)}`;
}

export async function verifyJWT(token: string, secret: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const signingInput = `${headerB64}.${payloadB64}`;

    const enc = new TextEncoder();
    const key = await getKey(secret);
    const signatureBuf = base64urlDecode(signatureB64);
    const signingInputBuf = enc.encode(signingInput).buffer as ArrayBuffer;

    const valid = await crypto.subtle.verify('HMAC', key, signatureBuf, signingInputBuf);
    if (!valid) return null;

    const payloadBuf = base64urlDecode(payloadB64);
    const payloadStr = new TextDecoder().decode(payloadBuf);
    const payload: SessionPayload = JSON.parse(payloadStr);
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function getSession(request: Request): Promise<SessionPayload | null> {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|;\s*)auth_session=([^;]+)/);
  if (!match) return null;

  const secret = process.env.AUTH_SECRET || '';
  return verifyJWT(match[1], secret);
}

export function createSessionCookie(token: string): string {
  return `auth_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 7}`;
}

export function clearSessionCookie(): string {
  return `auth_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}
