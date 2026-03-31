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
  const plan = searchParams.get('plan') || 'single';
  
  if (!orderId) {
    return NextResponse.redirect(new URL('/pricing?error=missing_order', request.url));
  }

  try {
    const capture = await capturePayPalOrder(orderId);
    
    if (capture.status === 'COMPLETED') {
      const user = db.getUser(session.sub);
      if (user) {
        // Update based on plan type
        if (plan === 'single') {
          db.updateUser(session.sub, {
            userType: 'pay_per_use',
            remainingCredits: user.remainingCredits + 1,
          });
        } else if (plan === 'package') {
          db.updateUser(session.sub, {
            userType: 'pay_per_use',
            remainingCredits: user.remainingCredits + 5,
            unlimitedStandardSwitch: true,
          });
        } else if (plan === 'subscription') {
          const now = Date.now();
          const endDate = now + (60 * 24 * 60 * 60 * 1000); // 60 days
          db.updateUser(session.sub, {
            userType: 'subscription',
            subscriptionEndDate: endDate,
            unlimitedStandardSwitch: true,
          });
        }
      }
      
      return NextResponse.redirect(new URL('/dashboard?success=true', request.url));
    } else {
      return NextResponse.redirect(new URL('/pricing?error=payment_failed', request.url));
    }
  } catch (error) {
    return NextResponse.redirect(new URL('/pricing?error=capture_failed', request.url));
  }
}
