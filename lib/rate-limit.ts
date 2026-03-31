// IP rate limiting for guest users
const guestAnalysis = new Map<string, number>();
const freeUserAnalysis = new Map<string, number>();

export function checkGuestLimit(ip: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const lastAnalysis = guestAnalysis.get(ip);
  
  // 24 hours = 86400000 ms
  const ONE_DAY = 24 * 60 * 60 * 1000;
  
  if (lastAnalysis && now - lastAnalysis < ONE_DAY) {
    return {
      allowed: false,
      resetTime: lastAnalysis + ONE_DAY,
    };
  }
  
  guestAnalysis.set(ip, now);
  return { allowed: true };
}

export function checkFreeUserLimit(userId: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const lastAnalysis = freeUserAnalysis.get(userId);
  
  const ONE_DAY = 24 * 60 * 60 * 1000;
  
  if (lastAnalysis && now - lastAnalysis < ONE_DAY) {
    return {
      allowed: false,
      resetTime: lastAnalysis + ONE_DAY,
    };
  }
  
  freeUserAnalysis.set(userId, now);
  return { allowed: true };
}

// Clean up old entries (optional, run periodically)
export function cleanupGuestLimits() {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  
  for (const [ip, time] of guestAnalysis.entries()) {
    if (now - time > ONE_DAY) {
      guestAnalysis.delete(ip);
    }
  }
}
