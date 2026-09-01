import { NextRequest } from 'next/server';
import { store } from '@/lib/data-store';
import { DoubleEntryLedgerService } from '@/lib/ledger';
import {
  stripeListResponse,
  stripeObjectResponse,
  stripeErrorResponse,
  parsePaginationParams,
} from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { limit, startingAfter } = parsePaginationParams(request.url);
    let invoices = store.getInvoices();

    if (startingAfter) {
      const idx = invoices.findIndex((i) => i.id === startingAfter);
      if (idx !== -1) {
        invoices = invoices.slice(idx + 1);
      }
    }

    const hasMore = invoices.length > limit;
    const paginated = invoices.slice(0, limit);
    const nextCursor = hasMore && paginated.length > 0 ? paginated[paginated.length - 1].id : null;

    return stripeListResponse(paginated, {
      hasMore,
      nextCursor,
      url: '/v1/invoices',
      objectType: 'invoice',
    });
  } catch (err: any) {
    return stripeErrorResponse({
      type: 'api_error',
      code: 'internal_error',
      message: err.message || 'Failed to retrieve invoices',
    }, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId, action } = body;

    // 1. Process Invoice Settlement / Payment
    if (action === 'pay') {
      const invoices = store.getInvoices();
      const invoice = invoices.find((inv) => inv.id === invoiceId);

      if (!invoice) {
        return stripeErrorResponse({
          type: 'invalid_request_error',
          code: 'resource_missing',
          message: `No such invoice exists: '${invoiceId}'`,
          param: 'invoiceId',
        }, 404);
      }

      invoice.status = 'paid';
      invoice.paidAt = new Date().toISOString();

      // Book to Double-Entry Ledger
      DoubleEntryLedgerService.recordInvoicePayment(
        invoice.invoiceNumber,
        invoice.subtotalCents,
        invoice.taxCents,
        invoice.discountCents,
        invoice.totalCents
      );

      return stripeObjectResponse(invoice, 'invoice');
    }

    // 2. Process Invoice Creation
    if (action === 'create' || body.customerId) {
      const amountCents = body.amountCents ? Number(body.amountCents) : Math.round(Number(body.amount || 0) * 100);

      if (!body.customerId) {
        return stripeErrorResponse({
          type: 'invalid_request_error',
          code: 'parameter_missing',
          message: 'customerId is required',
          param: 'customerId',
        }, 400);
      }

      if (!amountCents || amountCents <= 0) {
        return stripeErrorResponse({
          type: 'invalid_request_error',
          code: 'parameter_invalid',
          message: 'Invoice amount must be greater than zero',
          param: 'amount',
        }, 400);
      }

      const newInvoice = store.addInvoice({
        customerId: body.customerId,
        description: body.description || 'Monthly SaaS Subscription Services',
        amountCents,
      });

      return stripeObjectResponse(newInvoice, 'invoice', 201);
    }

    return stripeErrorResponse({
      type: 'invalid_request_error',
      code: 'parameter_invalid',
      message: "Unsupported action. Expected 'pay' or 'create'",
      param: 'action',
    }, 400);
  } catch (err: any) {
    return stripeErrorResponse({
      type: 'api_error',
      code: 'internal_error',
      message: err.message || 'Internal server error',
    }, 500);
  }
}
