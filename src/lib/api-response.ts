import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export type StripeErrorType =
  | 'api_error'
  | 'card_error'
  | 'idempotency_error'
  | 'invalid_request_error'
  | 'authentication_error'
  | 'rate_limit_error';

export interface StripeErrorPayload {
  type: StripeErrorType;
  code: string;
  message: string;
  param?: string;
  docUrl?: string;
}

/**
 * Standard Stripe List Response Envelope
 */
export function stripeListResponse<T extends { id?: string }>(
  data: T[],
  options: {
    hasMore?: boolean;
    nextCursor?: string | null;
    url?: string;
    objectType?: string;
  } = {}
) {
  return NextResponse.json({
    object: 'list',
    data: data.map((item) => ({
      object: options.objectType || 'item',
      ...item,
    })),
    has_more: options.hasMore ?? false,
    next_cursor: options.nextCursor ?? null,
    url: options.url || '/v1',
  });
}

/**
 * Standard Stripe Single Object Response Envelope
 */
export function stripeObjectResponse<T extends Record<string, any>>(
  data: T,
  objectType: string,
  status: number = 200
) {
  return NextResponse.json(
    {
      object: objectType,
      ...data,
    },
    { status }
  );
}

/**
 * Standard Stripe Error Envelope
 */
export function stripeErrorResponse(
  error: StripeErrorPayload,
  status: number = 400
) {
  return NextResponse.json(
    {
      error: {
        type: error.type,
        code: error.code,
        message: error.message,
        param: error.param,
        doc_url: error.docUrl || 'https://docs.stripoo.dev/errors',
      },
    },
    { status }
  );
}

/**
 * Converts Zod Validation Errors into Stripe-grade Parameter Error Responses
 */
export function stripeZodErrorResponse(zodError: ZodError) {
  const firstIssue = zodError.issues[0];
  const param = firstIssue.path.join('.');
  return stripeErrorResponse(
    {
      type: 'invalid_request_error',
      code: 'parameter_invalid',
      message: `${param ? `Field '${param}': ` : ''}${firstIssue.message}`,
      param: param || undefined,
    },
    422
  );
}

/**
 * Cursor Pagination Utility for In-Memory and DB Queries
 */
export function parsePaginationParams(url: string) {
  const { searchParams } = new URL(url);
  const rawLimit = searchParams.get('limit');
  const limit = Math.min(Math.max(Number(rawLimit) || 20, 1), 100);
  const startingAfter = searchParams.get('starting_after') || null;
  const endingBefore = searchParams.get('ending_before') || null;

  return { limit, startingAfter, endingBefore };
}
