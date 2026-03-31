// PayPal configuration
export const PAYPAL_CONFIG = {
  clientId: process.env.PAYPAL_CLIENT_ID || '',
  secret: process.env.PAYPAL_SECRET || '',
  mode: process.env.PAYPAL_MODE || 'live', // 'sandbox' or 'live'
  apiBase: process.env.PAYPAL_MODE === 'sandbox' 
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com',
};

export const PRICING = {
  single: { amount: '0.99', currency: 'USD', credits: 1 },
  package: { amount: '2.99', currency: 'USD', credits: 5, unlimitedStandards: true },
  subscription: { amount: '9.99', currency: 'USD', days: 60, credits: 50 },
};

export async function getPayPalAccessToken(): Promise<string | null> {
  try {
    const auth = Buffer.from(`${PAYPAL_CONFIG.clientId}:${PAYPAL_CONFIG.secret}`).toString('base64');
    
    const response = await fetch(`${PAYPAL_CONFIG.apiBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    return data.access_token || null;
  } catch (error) {
    console.error('PayPal auth error:', error);
    return null;
  }
}

export async function createPayPalOrder(amount: string, currency: string = 'USD'): Promise<any> {
  const accessToken = await getPayPalAccessToken();
  if (!accessToken) return null;

  try {
    const response = await fetch(`${PAYPAL_CONFIG.apiBase}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount,
          },
        }],
        application_context: {
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
        },
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('PayPal order creation error:', error);
    return null;
  }
}

export async function capturePayPalOrder(orderId: string): Promise<any> {
  const accessToken = await getPayPalAccessToken();
  if (!accessToken) return null;

  try {
    const response = await fetch(`${PAYPAL_CONFIG.apiBase}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return await response.json();
  } catch (error) {
    console.error('PayPal capture error:', error);
    return null;
  }
}
