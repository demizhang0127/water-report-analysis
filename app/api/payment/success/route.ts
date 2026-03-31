import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { capturePayPalOrder, PRICING } from '@/lib/paypal';
import { db } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('token');
  
  if (!orderId) {
    return NextResponse.redirect(new URL('/pricing?error=missing_order', request.url));
  }

  try {
    const capture = await capturePayPalOrder(orderId);
    
    if (capture.status === 'COMPLETED') {
      const user = db.getUser(session.sub);
      if (user) {
        // Update user based on plan (simplified - you'd get plan from order metadata)
        db.updateUser(session.sub, {
          userType: 'pay_per_use',
          remainingCredits: user.remainingCredits + 1,
        });
      }
      
      return NextResponse.redirect(new URL('/dashboard?success=true', request.url));
    } else {
      return NextResponse.redirect(new URL('/pricing?error=payment_failed', request.url));
    }
  } catch (error) {
    return NextResponse.redirect(new URL('/pricing?error=capture_failed', request.url));
  }
}
