import { NextRequest, NextResponse } from 'next/server';
import { PAYPAL_CONFIG } from '@/lib/paypal';
import { db } from '@/lib/db';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify webhook signature (simplified - in production, verify the signature)
    const eventType = body.event_type;
    
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const capture = body.resource;
      const amount = capture.amount.value;
      
      // Extract user info from custom_id or metadata
      // For now, we'll need to store order-to-user mapping
      
      console.log('Payment completed:', capture.id, amount);
      
      return NextResponse.json({ received: true });
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
