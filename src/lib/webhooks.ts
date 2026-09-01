// ============================================================================
// STRIPOO - HMAC-SHA256 WEBHOOK SIGNER & DELIVERY DISPATCHER
// ============================================================================

import { store } from './data-store';
import { WebhookDelivery } from './types';

export class WebhookDispatcher {
  /**
   * Generates a Stripe-like HMAC signature header:
   * t=1787768728,v1=9b82a3c749e1e2...
   */
  public static signPayload(secret: string, payload: any): { timestamp: number; signature: string; header: string } {
    const timestamp = Math.floor(Date.now() / 1000);
    const rawPayload = JSON.stringify(payload);
    
    // Simple fast HMAC simulation for browser/Node edge environments
    let hash = 0;
    const combined = `${timestamp}.${rawPayload}.${secret}`;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const signature = Math.abs(hash).toString(16).padStart(64, 'a');
    const header = `t=${timestamp},v1=${signature}`;

    return { timestamp, signature, header };
  }

  /**
   * Dispatches or simulates an outbound webhook event with logging.
   */
  public static async dispatchEvent(
    eventType: string,
    payload: any,
    targetUrl: string = 'https://api.acme.com/webhooks/stripoo'
  ): Promise<WebhookDelivery> {
    const startTime = performance.now();
    const workspace = store.getWorkspace();
    const { header } = this.signPayload(workspace.webhookSecret, payload);

    // Simulate network roundtrip latency (25ms - 65ms)
    await new Promise((r) => setTimeout(r, Math.floor(Math.random() * 40) + 25));

    const latencyMs = Math.round(performance.now() - startTime);

    const delivery = store.addWebhookDelivery({
      endpointId: 'we_01',
      eventType,
      payload,
      statusCode: 200,
      latencyMs,
      attempts: 1,
      success: true,
      signature: header,
    });

    return delivery;
  }
}
