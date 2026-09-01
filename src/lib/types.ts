// ============================================================================
// STRIPOO - CORE TYPE DEFINITIONS & CONTRACTS
// ============================================================================

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'unpaid'
  | 'canceled'
  | 'paused';

export type PriceType = 'RECURRING' | 'USAGE_TIERED' | 'PER_SEAT';
export type BillingInterval = 'month' | 'year' | 'week' | 'day';
export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
export type CouponDuration = 'once' | 'repeating' | 'forever';
export type LedgerAccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type LedgerDirection = 'DEBIT' | 'CREDIT';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  defaultCurrency: string;
  webhookSecret: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  workspaceId: string;
  email: string;
  name: string;
  balanceCents: number;
  currency: string;
  paymentMethodId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Plan {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  prices: Price[];
}

export interface Price {
  id: string;
  planId: string;
  type: PriceType;
  unitAmountCents: number;
  interval: BillingInterval;
  meterEventName?: string;
  pricingTiers?: {
    upTo: number | 'inf';
    unitAmountCents: number;
  }[];
}

export interface Subscription {
  id: string;
  workspaceId: string;
  customerId: string;
  priceId: string;
  status: SubscriptionStatus;
  quantity: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  createdAt: string;
  customer?: Customer;
  price?: Price;
}

export interface UsageEvent {
  id: string;
  workspaceId: string;
  customerId: string;
  eventName: string;
  value: number;
  idempotencyKey?: string;
  properties?: Record<string, any>;
  timestamp: string;
  customerName?: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitAmountCents: number;
  totalAmountCents: number;
}

export interface Invoice {
  id: string;
  workspaceId: string;
  customerId: string;
  subscriptionId?: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  subtotalCents: number;
  taxCents: number;
  discountCents: number;
  totalCents: number;
  currency: string;
  dueDate: string;
  paidAt?: string;
  pdfUrl?: string;
  createdAt: string;
  customer?: Customer;
  items: InvoiceItem[];
}

export interface Coupon {
  id: string;
  workspaceId: string;
  code: string;
  percentOff?: number;
  amountOffCents?: number;
  duration: CouponDuration;
  maxRedemptions?: number;
  redeemedCount: number;
  expiresAt?: string;
}

export interface LedgerAccount {
  id: string;
  workspaceId: string;
  code: string;
  name: string;
  type: LedgerAccountType;
}

export interface LedgerEntry {
  id: string;
  transactionGroupId: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  direction: LedgerDirection;
  amountCents: number;
  referenceId?: string;
  createdAt: string;
}

export interface WebhookEndpoint {
  id: string;
  workspaceId: string;
  url: string;
  events: string[];
  secret: string;
  enabled: boolean;
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  endpointId: string;
  eventType: string;
  payload: any;
  statusCode?: number;
  latencyMs?: number;
  attempts: number;
  success: boolean;
  signature: string;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  workspaceId: string;
  keyType: 'publishable' | 'secret';
  keyHash: string;
  name: string;
  environment: 'live' | 'test';
  createdAt: string;
}

export interface Payment {
  id: string;
  workspaceId: string;
  customerId: string;
  amountCents: number;
  currency: string;
  status: 'succeeded' | 'refunded' | 'failed';
  paymentMethod: {
    brand: 'visa' | 'mastercard' | 'amex';
    last4: string;
  };
  description: string;
  receiptNumber: string;
  refundedAmountCents?: number;
  refundReason?: string;
  isTest?: boolean;
  createdAt: string;
  customer?: Customer;
}
