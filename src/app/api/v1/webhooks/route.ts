import { NextResponse } from 'next/server';
import { WebhookDispatcher } from '@/lib/webhooks';
import { store } from '@/lib/data-store';

export async function GET() {
  const endpoints = store.getWebhookEndpoints();
  const deliveries = store.getWebhookDeliveries();
  return NextResponse.json({
    endpoints,
    recent_deliveries: deliveries,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_type = 'invoice.paid', payload, target_url } = body;

    const testPayload = payload || {
      id: `evt_sim_${Date.now()}`,
      type: event_type,
      data: {
        object: {
          id: 'in_01HX891',
          customer: 'cus_01HX89A',
          amount_paid: 28372,
          currency: 'usd',
          status: 'paid',
        },
      },
      created_at: new Date().toISOString(),
    };

    const delivery = await WebhookDispatcher.dispatchEvent(
      event_type,
      testPayload,
      target_url
    );

    return NextResponse.json({
      success: true,
      message: 'Simulated webhook event dispatched with HMAC-SHA256 signature.',
      delivery,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: error.message || 'Internal server error' } },
      { status: 500 }
    );
  }
}
