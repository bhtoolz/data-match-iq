import { NextRequest } from 'next/server';
import { store } from '@/lib/data-store';
import {
  stripeListResponse,
  stripeObjectResponse,
  stripeErrorResponse,
  stripeZodErrorResponse,
  parsePaginationParams,
} from '@/lib/api-response';
import { RefundPaymentSchema } from '@/lib/validation-schemas';

export async function GET(request: NextRequest) {
  try {
    const { limit, startingAfter } = parsePaginationParams(request.url);
    const { searchParams } = new URL(request.url);
    const isTest = searchParams.get('test') === 'true';

    let payments = store.getPayments(isTest ? true : false);

    if (startingAfter) {
      const idx = payments.findIndex((p) => p.id === startingAfter);
      if (idx !== -1) {
        payments = payments.slice(idx + 1);
      }
    }

    const hasMore = payments.length > limit;
    const paginated = payments.slice(0, limit);
    const nextCursor = hasMore && paginated.length > 0 ? paginated[paginated.length - 1].id : null;

    return stripeListResponse(paginated, {
      hasMore,
      nextCursor,
      url: '/v1/payments',
      objectType: 'charge',
    });
  } catch (err: any) {
    return stripeErrorResponse({
      type: 'api_error',
      code: 'internal_error',
      message: err.message || 'Failed to retrieve payments',
    }, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = RefundPaymentSchema.safeParse(body);

    if (!result.success) {
      return stripeZodErrorResponse(result.error);
    }

    const { paymentId, reason } = result.data;
    const refunded = store.refundPayment(paymentId, reason);

    if (!refunded) {
      return stripeErrorResponse({
        type: 'invalid_request_error',
        code: 'resource_missing',
        message: `No such charge exists: '${paymentId}'`,
        param: 'paymentId',
      }, 404);
    }

    return stripeObjectResponse(refunded, 'charge');
  } catch (err: any) {
    return stripeErrorResponse({
      type: 'api_error',
      code: 'internal_error',
      message: err.message || 'Failed to process refund',
    }, 500);
  }
}
