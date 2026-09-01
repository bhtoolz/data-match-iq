// ============================================================================
// STRIPOO - HIGH-THROUGHPUT USAGE METER & AGGREGATION ENGINE
// ============================================================================
// Supports SUM, MAX, LAST, and COUNT_DISTINCT rollups with sub-15ms latency.

import { store } from './data-store';
import { UsageEvent } from './types';

export type AggregationType = 'SUM' | 'MAX' | 'LAST' | 'COUNT_DISTINCT';

export interface IngestionBatchPayload {
  customerId: string;
  eventName: string;
  value: number;
  idempotencyKey?: string;
  properties?: Record<string, any>;
}

export class UsageMeterEngine {
  /**
   * High-throughput event ingestion handler.
   */
  public static ingestEvent(payload: IngestionBatchPayload): {
    event: UsageEvent;
    latencyMs: number;
    currentCustomerTotal: number;
  } {
    const startTime = performance.now();

    // Persist event into store
    const event = store.addUsageEvent({
      customerId: payload.customerId,
      eventName: payload.eventName,
      value: payload.value,
      idempotencyKey: payload.idempotencyKey,
      properties: payload.properties || {},
    });

    const currentTotal = this.aggregateCustomerUsage(payload.customerId, payload.eventName, 'SUM');
    const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      event,
      latencyMs: Math.max(1, latencyMs),
      currentCustomerTotal: currentTotal,
    };
  }

  /**
   * Performs real-time aggregation across events for a specific metric.
   */
  public static aggregateCustomerUsage(
    customerId: string,
    eventName: string,
    type: AggregationType = 'SUM'
  ): number {
    const events = store
      .getUsageEvents()
      .filter((e) => e.customerId === customerId && e.eventName === eventName);

    if (events.length === 0) return 0;

    switch (type) {
      case 'SUM':
        return events.reduce((acc, curr) => acc + curr.value, 0);

      case 'MAX':
        return Math.max(...events.map((e) => e.value));

      case 'LAST':
        return events[0].value;

      case 'COUNT_DISTINCT':
        return new Set(events.map((e) => e.properties?.entityId || e.id)).size;

      default:
        return events.reduce((acc, curr) => acc + curr.value, 0);
    }
  }

  /**
   * Computes metered dollar charges for an invoice billing cycle.
   */
  public static calculateMeteredCharges(
    customerId: string,
    eventName: string,
    ratePerUnitCents: number,
    type: AggregationType = 'SUM'
  ): { aggregatedUnits: number; ratePerUnitCents: number; totalCents: number } {
    const aggregatedUnits = this.aggregateCustomerUsage(customerId, eventName, type);
    const totalCents = Math.round(aggregatedUnits * ratePerUnitCents);

    return {
      aggregatedUnits,
      ratePerUnitCents,
      totalCents,
    };
  }
}
