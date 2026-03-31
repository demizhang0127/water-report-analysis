import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createPayPalOrder, PRICING } from '@/lib/paypal';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { plan } = await request.json();
    
    let amount: string;
    let planType: string;
    
    if (plan === 'single') {
      amount = PRICING.single.amount;
      planType = 'single';
    } else if (plan === 'package') {
      amount = PRICING.package.amount;
      planType = 'package';
    } else if (plan === 'subscription') {
      amount = PRICING.subscription.amount;
      planType = 'subscription';
    } else {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const order = await createPayPalOrder(amount);
    
    if (!order || !order.id) {
      return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 });
    }

    // Find approval URL
    const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href;

    return NextResponse.json({
      orderId: order.id,
      approvalUrl: approvalUrl + `&plan=${planType}`,
      plan: planType,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Payment creation failed' }, { status: 500 });
  }
}
