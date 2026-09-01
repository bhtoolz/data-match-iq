import { NextRequest } from 'next/server';
import { store } from '@/lib/data-store';
import {
  stripeListResponse,
  stripeObjectResponse,
  stripeErrorResponse,
  stripeZodErrorResponse,
  parsePaginationParams,
} from '@/lib/api-response';
import { CreateCustomerSchema } from '@/lib/validation-schemas';

export async function GET(request: NextRequest) {
  try {
    const { limit, startingAfter } = parsePaginationParams(request.url);
    let customers = store.getCustomers();

    if (startingAfter) {
      const idx = customers.findIndex((c) => c.id === startingAfter);
      if (idx !== -1) {
        customers = customers.slice(idx + 1);
      }
    }

    const hasMore = customers.length > limit;
    const paginated = customers.slice(0, limit);
    const nextCursor = hasMore && paginated.length > 0 ? paginated[paginated.length - 1].id : null;

    return stripeListResponse(paginated, {
      hasMore,
      nextCursor,
      url: '/v1/customers',
      objectType: 'customer',
    });
  } catch (err: any) {
    return stripeErrorResponse({
      type: 'api_error',
      code: 'internal_error',
      message: err.message || 'Failed to retrieve customers',
    }, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Balance Credit / Adjustment Action
    if (body.action === 'adjust_balance') {
      const { customerId, deltaCents } = body;
      if (!customerId || typeof deltaCents !== 'number') {
        return stripeErrorResponse({
          type: 'invalid_request_error',
          code: 'parameter_missing',
          message: 'customerId and numeric deltaCents are required',
          param: 'deltaCents',
        }, 400);
      }

      const updatedCustomer = store.adjustCustomerBalance(customerId, deltaCents);
      if (!updatedCustomer) {
        return stripeErrorResponse({
          type: 'invalid_request_error',
          code: 'resource_missing',
          message: `No such customer: '${customerId}'`,
          param: 'customerId',
        }, 404);
      }

      return stripeObjectResponse(updatedCustomer, 'customer');
    }

    // 2. Customer Creation Action
    const result = CreateCustomerSchema.safeParse(body);

    if (!result.success) {
      return stripeZodErrorResponse(result.error);
    }

    const { email, name, currency, metadata } = result.data;

    const newCustomer = store.addCustomer({
      email,
      name: name || '',
      currency,
      paymentMethodId: 'pm_card_visa_4242',
      metadata: metadata || {},
    });

    return stripeObjectResponse(newCustomer, 'customer', 201);
  } catch (err: any) {
    return stripeErrorResponse({
      type: 'api_error',
      code: 'internal_error',
      message: err.message || 'Failed to create customer',
    }, 500);
  }
}
