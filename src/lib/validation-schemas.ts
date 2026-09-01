import { z } from 'zod';

export const CreateCustomerSchema = z.object({
  email: z.string().email('Invalid email address format'),
  name: z.string().min(1, 'Name cannot be empty').optional(),
  currency: z.string().length(3, 'Currency must be a 3-letter ISO code (e.g. USD)').default('USD'),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const IngestUsageEventSchema = z.object({
  customerId: z.string().min(1, 'customerId is required'),
  eventName: z.string().min(1, 'eventName is required'),
  value: z.number().positive('Meter value must be greater than zero'),
  idempotencyKey: z.string().optional(),
  properties: z.record(z.string(), z.any()).optional(),
});

export const CreateSubscriptionSchema = z.object({
  customerId: z.string().min(1, 'customerId is required'),
  priceId: z.string().min(1, 'priceId is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

export const CreateCouponSchema = z.object({
  code: z.string().min(3, 'Coupon code must be at least 3 characters').regex(/^[A-Z0-9_-]+$/, 'Coupon code must be uppercase alphanumeric'),
  percentOff: z.number().min(1).max(100, 'Discount cannot exceed 100%').optional(),
  amountOffCents: z.number().positive().optional(),
  duration: z.enum(['once', 'repeating', 'forever']).default('once'),
  maxRedemptions: z.number().int().positive().optional(),
});

export const RefundPaymentSchema = z.object({
  action: z.literal('refund'),
  paymentId: z.string().min(1, 'paymentId is required'),
  reason: z.enum([
    'Requested by customer',
    'Duplicate charge',
    'Fraudulent transaction',
    'Service canceled',
  ]).default('Requested by customer'),
});
