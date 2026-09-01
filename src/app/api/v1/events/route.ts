import { NextRequest } from 'next/server';
import { UsageMeterEngine } from '@/lib/usage-meter';
import { store } from '@/lib/data-store';
import {
  stripeListResponse,
  stripeErrorResponse,
  stripeZodErrorResponse,
  parsePaginationParams,
} from '@/lib/api-response';
import { IngestUsageEventSchema } from '@/lib/validation-schemas';

export async function GET(request: NextRequest) {
  try {
    const { limit, startingAfter } = parsePaginationParams(request.url);
    let events = store.getUsageEvents();

    if (startingAfter) {
      const idx = events.findIndex((e) => e.id === startingAfter);
      if (idx !== -1) {
        events = events.slice(idx + 1);
      }
    }

    const hasMore = events.length > limit;
    const paginated = events.slice(0, limit);
    const nextCursor = hasMore && paginated.length > 0 ? paginated[paginated.length - 1].id : null;

    return stripeListResponse(paginated, {
      hasMore,
      nextCursor,
      url: '/v1/events',
      objectType: 'usage_event',
    });
  } catch (err: any) {
    return stripeErrorResponse({
      type: 'api_error',
      code: 'internal_error',
      message: err.message || 'Failed to retrieve events',
    }, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventsToIngest = Array.isArray(body.events) ? body.events : [body];

    if (eventsToIngest.length === 0) {
      return stripeErrorResponse({
        type: 'invalid_request_error',
        code: 'parameter_missing',
        message: 'At least one event is required in payload',
        param: 'events',
      }, 400);
    }

    const results = [];
    for (const evt of eventsToIngest) {
      const parsed = IngestUsageEventSchema.safeParse(evt);
      if (!parsed.success) {
        return stripeZodErrorResponse(parsed.error);
      }

      const res = UsageMeterEngine.ingestEvent({
        customerId: parsed.data.customerId,
        eventName: parsed.data.eventName,
        value: parsed.data.value,
        idempotencyKey: parsed.data.idempotencyKey,
        properties: parsed.data.properties,
      });
      results.push(res);
    }

    return Response.json(
      {
        object: 'event_ingestion_batch',
        accepted_count: results.length,
        average_latency_ms: (
          results.reduce((a, b) => a + b.latencyMs, 0) / results.length
        ).toFixed(2),
        sample_event: results[0].event,
      },
      { status: 202 }
    );
  } catch (err: any) {
    return stripeErrorResponse({
      type: 'api_error',
      code: 'internal_error',
      message: err.message || 'Failed to ingest events',
    }, 500);
  }
}
