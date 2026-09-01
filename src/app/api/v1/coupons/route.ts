import { NextRequest } from 'next/server';
import { store } from '@/lib/data-store';
import {
  stripeListResponse,
  stripeObjectResponse,
  stripeErrorResponse,
  stripeZodErrorResponse,
  parsePaginationParams,
} from '@/lib/api-response';
import { CreateCouponSchema } from '@/lib/validation-schemas';

export async function GET(request: NextRequest) {
  try {
    const { limit, startingAfter } = parsePaginationParams(request.url);
    let coupons = store.getCoupons();

    if (startingAfter) {
      const idx = coupons.findIndex((c) => c.id === startingAfter);
      if (idx !== -1) {
        coupons = coupons.slice(idx + 1);
      }
    }

    const hasMore = coupons.length > limit;
    const paginated = coupons.slice(0, limit);
    const nextCursor = hasMore && paginated.length > 0 ? paginated[paginated.length - 1].id : null;

    return stripeListResponse(paginated, {
      hasMore,
      nextCursor,
      url: '/v1/coupons',
      objectType: 'coupon',
    });
  } catch (err: any) {
    return stripeErrorResponse({
      type: 'api_error',
      code: 'internal_error',
      message: err.message || 'Failed to retrieve coupons',
    }, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = CreateCouponSchema.safeParse(body);

    if (!result.success) {
      return stripeZodErrorResponse(result.error);
    }

    const { code, percentOff, amountOffCents, duration, maxRedemptions } = result.data;

    const newCoupon = store.addCoupon({
      code: code.toUpperCase(),
      percentOff,
      amountOffCents,
      duration,
      maxRedemptions: maxRedemptions || 100,
    });

    return stripeObjectResponse(newCoupon, 'coupon', 201);
  } catch (err: any) {
    return stripeErrorResponse({
      type: 'api_error',
      code: 'internal_error',
      message: err.message || 'Failed to create coupon',
    }, 500);
  }
}
