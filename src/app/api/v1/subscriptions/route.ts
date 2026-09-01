import { NextRequest } from 'next/server';
import { store } from '@/lib/data-store';
import { DoubleEntryLedgerService } from '@/lib/ledger';
import {
  stripeListResponse,
  stripeObjectResponse,
  stripeErrorResponse,
  stripeZodErrorResponse,
  parsePaginationParams,
} from '@/lib/api-response';
import { CreateSubscriptionSchema } from '@/lib/validation-schemas';

export async function GET(request: NextRequest) {
  try {
    const { limit, startingAfter } = parsePaginationParams(request.url);
    let subscriptions = store.getSubscriptions();

    if (startingAfter) {
      const idx = subscriptions.findIndex((s) => s.id === startingAfter);
      if (idx !== -1) {
        subscriptions = subscriptions.slice(idx + 1);
      }
    }

    const hasMore = subscriptions.length > limit;
    const paginated = subscriptions.slice(0, limit);
    const nextCursor = hasMore && paginated.length > 0 ? paginated[paginated.length - 1].id : null;

    return stripeListResponse(paginated, {
      hasMore,
      nextCursor,
      url: '/v1/subscriptions',
      objectType: 'subscription',
    });
  } catch (err: any) {
    return stripeErrorResponse({
      type: 'api_error',
      code: 'internal_error',
      message: err.message || 'Failed to retrieve subscriptions',
    }, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = CreateSubscriptionSchema.safeParse(body);

    if (!result.success) {
      return stripeZodErrorResponse(result.error);
    }

    const { customerId, priceId, quantity } = result.data;

    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const subscription = store.addSubscription({
      customerId,
      priceId,
      status: 'active',
      quantity,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: nextMonth.toISOString(),
      cancelAtPeriodEnd: false,
    });

    // Auto-record initial revenue into Double-Entry Ledger
    const price = store.getPlans().flatMap((p) => p.prices).find((pr) => pr.id === priceId);
    const amountCents = (price?.unitAmountCents || 2900) * quantity;

    DoubleEntryLedgerService.postJournalEntry(subscription.id, [
      {
        accountCode: '1000',
        accountName: 'Cash & Payment Clearing',
        direction: 'DEBIT',
        amountCents,
      },
      {
        accountCode: '4000',
        accountName: 'Subscription SaaS Revenue',
        direction: 'CREDIT',
        amountCents,
      },
    ]);

    return stripeObjectResponse(subscription, 'subscription', 201);
  } catch (err: any) {
    return stripeErrorResponse({
      type: 'api_error',
      code: 'internal_error',
      message: err.message || 'Failed to create subscription',
    }, 500);
  }
}
