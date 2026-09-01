// ============================================================================
// STRIPOO - MASTER DATA STORE & ENTITY REPOSITORY
// ============================================================================
// Provides seed data, state persistence, and atomic operations.

import {
  Workspace,
  Customer,
  Plan,
  Price,
  Subscription,
  UsageEvent,
  Invoice,
  Coupon,
  LedgerAccount,
  LedgerEntry,
  WebhookEndpoint,
  WebhookDelivery,
  ApiKey,
  Payment,
} from './types';

class StripooDataStore {
  private workspace: Workspace = {
    id: 'ws_stripoo_primary',
    name: 'Acme SaaS Cloud',
    slug: 'acme-saas',
    defaultCurrency: 'USD',
    webhookSecret: 'whsec_9b82a3c749e1e2f801a2b3c4d5e6f7a8',
    createdAt: '2026-01-01T00:00:00Z',
  };

  private customers: Customer[] = [
    {
      id: 'cus_01HX89A',
      workspaceId: 'ws_stripoo_primary',
      email: 'alex@hyperai.io',
      name: 'HyperAI Technologies',
      balanceCents: 45000,
      currency: 'USD',
      paymentMethodId: 'pm_card_visa_4242',
      metadata: { segment: 'Enterprise AI', account_tier: 'Tier 1' },
      createdAt: '2026-06-12T10:14:00Z',
    },
    {
      id: 'cus_01HX89B',
      workspaceId: 'ws_stripoo_primary',
      email: 'finance@vortexlabs.com',
      name: 'Vortex Labs LLC',
      balanceCents: 12000,
      currency: 'USD',
      paymentMethodId: 'pm_card_mc_5555',
      metadata: { segment: 'DevTools', team_size: '48' },
      createdAt: '2026-07-01T08:30:00Z',
    },
    {
      id: 'cus_01HX89C',
      workspaceId: 'ws_stripoo_primary',
      email: 'sarah@novasoft.dev',
      name: 'NovaSoft Inc',
      balanceCents: 0,
      currency: 'USD',
      paymentMethodId: 'pm_card_amex_0005',
      metadata: { segment: 'Fintech SaaS' },
      createdAt: '2026-07-15T14:20:00Z',
    },
    {
      id: 'cus_01HX89D',
      workspaceId: 'ws_stripoo_primary',
      email: 'david@zenithvector.ai',
      name: 'Zenith Vector AI',
      balanceCents: 98000,
      currency: 'USD',
      paymentMethodId: 'pm_card_visa_1111',
      metadata: { segment: 'LLM Infrastructure' },
      createdAt: '2026-08-01T11:00:00Z',
    },
    {
      id: 'cus_01HX89E',
      workspaceId: 'ws_stripoo_primary',
      email: 'ops@cloudscale.net',
      name: 'CloudScale Networks',
      balanceCents: 2400,
      currency: 'USD',
      paymentMethodId: 'pm_card_visa_8888',
      metadata: { segment: 'Cloud Infra' },
      createdAt: '2026-08-10T16:45:00Z',
    },
  ];

  private plans: Plan[] = [
    {
      id: 'plan_starter',
      workspaceId: 'ws_stripoo_primary',
      name: 'Starter Developer',
      description: 'Ideal for early-stage apps and solo founders.',
      prices: [
        {
          id: 'price_starter_mo',
          planId: 'plan_starter',
          type: 'RECURRING',
          unitAmountCents: 2900,
          interval: 'month',
        },
      ],
    },
    {
      id: 'plan_pro',
      workspaceId: 'ws_stripoo_primary',
      name: 'Pro Scale + AI Metering',
      description: 'Hybrid base subscription plus real-time metered AI token billing.',
      prices: [
        {
          id: 'price_pro_mo',
          planId: 'plan_pro',
          type: 'RECURRING',
          unitAmountCents: 9900,
          interval: 'month',
        },
        {
          id: 'price_pro_tokens',
          planId: 'plan_pro',
          type: 'USAGE_TIERED',
          unitAmountCents: 15, // 0.15 cents per 1k tokens
          interval: 'month',
          meterEventName: 'llm_tokens',
        },
        {
          id: 'price_pro_seat',
          planId: 'plan_pro',
          type: 'PER_SEAT',
          unitAmountCents: 1500, // $15 / seat / mo
          interval: 'month',
        },
      ],
    },
    {
      id: 'plan_enterprise',
      workspaceId: 'ws_stripoo_primary',
      name: 'Enterprise Dedicated',
      description: 'High-throughput SLA, custom volume discounting, dedicated support.',
      prices: [
        {
          id: 'price_ent_mo',
          planId: 'plan_enterprise',
          type: 'RECURRING',
          unitAmountCents: 49900,
          interval: 'month',
        },
      ],
    },
  ];

  private subscriptions: Subscription[] = [
    {
      id: 'sub_01HX_AI_PRO',
      workspaceId: 'ws_stripoo_primary',
      customerId: 'cus_01HX89A',
      priceId: 'price_pro_mo',
      status: 'active',
      quantity: 14,
      currentPeriodStart: '2026-08-01T00:00:00Z',
      currentPeriodEnd: '2026-09-01T00:00:00Z',
      cancelAtPeriodEnd: false,
      createdAt: '2026-06-12T10:20:00Z',
    },
    {
      id: 'sub_01HX_DEV_VORTEX',
      workspaceId: 'ws_stripoo_primary',
      customerId: 'cus_01HX89B',
      priceId: 'price_starter_mo',
      status: 'active',
      quantity: 1,
      currentPeriodStart: '2026-08-01T00:00:00Z',
      currentPeriodEnd: '2026-09-01T00:00:00Z',
      cancelAtPeriodEnd: false,
      createdAt: '2026-07-01T08:40:00Z',
    },
    {
      id: 'sub_01HX_NOVA_PAST_DUE',
      workspaceId: 'ws_stripoo_primary',
      customerId: 'cus_01HX89C',
      priceId: 'price_pro_mo',
      status: 'past_due',
      quantity: 4,
      currentPeriodStart: '2026-07-15T00:00:00Z',
      currentPeriodEnd: '2026-08-15T00:00:00Z',
      cancelAtPeriodEnd: false,
      createdAt: '2026-07-15T14:30:00Z',
    },
    {
      id: 'sub_01HX_ZENITH_ENTERPRISE',
      workspaceId: 'ws_stripoo_primary',
      customerId: 'cus_01HX89D',
      priceId: 'price_ent_mo',
      status: 'active',
      quantity: 1,
      currentPeriodStart: '2026-08-01T00:00:00Z',
      currentPeriodEnd: '2026-09-01T00:00:00Z',
      cancelAtPeriodEnd: false,
      createdAt: '2026-08-01T11:15:00Z',
    },
  ];

  private usageEvents: UsageEvent[] = [
    {
      id: 'evt_01HX991',
      workspaceId: 'ws_stripoo_primary',
      customerId: 'cus_01HX89A',
      eventName: 'llm_tokens',
      value: 12500,
      timestamp: '2026-08-26T23:15:10Z',
      customerName: 'HyperAI Technologies',
      properties: { model: 'claude-3-5-sonnet', region: 'us-east-1' },
    },
    {
      id: 'evt_01HX992',
      workspaceId: 'ws_stripoo_primary',
      customerId: 'cus_01HX89D',
      eventName: 'vector_searches',
      value: 8400,
      timestamp: '2026-08-26T23:18:22Z',
      customerName: 'Zenith Vector AI',
      properties: { index: 'financial-filings-v2' },
    },
    {
      id: 'evt_01HX993',
      workspaceId: 'ws_stripoo_primary',
      customerId: 'cus_01HX89B',
      eventName: 'api_requests',
      value: 450,
      timestamp: '2026-08-26T23:22:01Z',
      customerName: 'Vortex Labs LLC',
      properties: { endpoint: '/v1/compile' },
    },
    {
      id: 'evt_01HX994',
      workspaceId: 'ws_stripoo_primary',
      customerId: 'cus_01HX89A',
      eventName: 'llm_tokens',
      value: 38200,
      timestamp: '2026-08-26T23:24:45Z',
      customerName: 'HyperAI Technologies',
      properties: { model: 'gpt-4o', task: 'code-gen' },
    },
    {
      id: 'evt_01HX995',
      workspaceId: 'ws_stripoo_primary',
      customerId: 'cus_01HX89E',
      eventName: 'bandwidth_gb',
      value: 140,
      timestamp: '2026-08-26T23:27:00Z',
      customerName: 'CloudScale Networks',
      properties: { cdn_node: 'eu-frankfurt' },
    },
  ];

  private invoices: Invoice[] = [
    {
      id: 'in_01HX891',
      workspaceId: 'ws_stripoo_primary',
      customerId: 'cus_01HX89A',
      subscriptionId: 'sub_01HX_AI_PRO',
      invoiceNumber: 'INV-2026-0042',
      status: 'paid',
      subtotalCents: 30900,
      taxCents: 2472,
      discountCents: 5000,
      totalCents: 28372,
      currency: 'USD',
      dueDate: '2026-08-15T00:00:00Z',
      paidAt: '2026-08-12T14:10:00Z',
      createdAt: '2026-08-01T00:00:00Z',
      items: [
        {
          id: 'ii_01',
          invoiceId: 'in_01HX891',
          description: 'Pro Scale Base Plan (August 2026)',
          quantity: 1,
          unitAmountCents: 9900,
          totalAmountCents: 9900,
        },
        {
          id: 'ii_02',
          invoiceId: 'in_01HX891',
          description: 'Team Seats Add-on (14 Seats @ $15.00)',
          quantity: 14,
          unitAmountCents: 1500,
          totalAmountCents: 21000,
        },
      ],
    },
    {
      id: 'in_01HX892',
      workspaceId: 'ws_stripoo_primary',
      customerId: 'cus_01HX89D',
      subscriptionId: 'sub_01HX_ZENITH_ENTERPRISE',
      invoiceNumber: 'INV-2026-0041',
      status: 'open',
      subtotalCents: 49900,
      taxCents: 3992,
      discountCents: 0,
      totalCents: 53892,
      currency: 'USD',
      dueDate: '2026-09-01T00:00:00Z',
      createdAt: '2026-08-01T00:00:00Z',
      items: [
        {
          id: 'ii_03',
          invoiceId: 'in_01HX892',
          description: 'Enterprise Dedicated Tier (August 2026)',
          quantity: 1,
          unitAmountCents: 49900,
          totalAmountCents: 49900,
        },
      ],
    },
    {
      id: 'in_01HX893',
      workspaceId: 'ws_stripoo_primary',
      customerId: 'cus_01HX89C',
      subscriptionId: 'sub_01HX_NOVA_PAST_DUE',
      invoiceNumber: 'INV-2026-0040',
      status: 'open',
      subtotalCents: 15900,
      taxCents: 1272,
      discountCents: 0,
      totalCents: 17172,
      currency: 'USD',
      dueDate: '2026-08-15T00:00:00Z',
      createdAt: '2026-07-15T00:00:00Z',
      items: [
        {
          id: 'ii_04',
          invoiceId: 'in_01HX893',
          description: 'Pro Scale Plan (July-August 2026)',
          quantity: 1,
          unitAmountCents: 9900,
          totalAmountCents: 9900,
        },
        {
          id: 'ii_05',
          invoiceId: 'in_01HX893',
          description: 'Team Seats Add-on (4 Seats @ $15.00)',
          quantity: 4,
          unitAmountCents: 1500,
          totalAmountCents: 6000,
        },
      ],
    },
    {
      id: 'in_01HX894',
      workspaceId: 'ws_stripoo_primary',
      customerId: 'cus_01HX89B',
      subscriptionId: 'sub_01HX_DEV_VORTEX',
      invoiceNumber: 'INV-2026-0039',
      status: 'paid',
      subtotalCents: 2900,
      taxCents: 232,
      discountCents: 0,
      totalCents: 3132,
      currency: 'USD',
      dueDate: '2026-08-05T00:00:00Z',
      paidAt: '2026-08-01T08:45:00Z',
      createdAt: '2026-08-01T00:00:00Z',
      items: [
        {
          id: 'ii_06',
          invoiceId: 'in_01HX894',
          description: 'Starter Developer Monthly',
          quantity: 1,
          unitAmountCents: 2900,
          totalAmountCents: 2900,
        },
      ],
    },
  ];

  private coupons: Coupon[] = [
    {
      id: 'cpn_launch2026',
      workspaceId: 'ws_stripoo_primary',
      code: 'LAUNCH2026',
      percentOff: 20,
      duration: 'repeating',
      maxRedemptions: 500,
      redeemedCount: 142,
      expiresAt: '2026-12-31T23:59:59Z',
    },
    {
      id: 'cpn_ai_credits50',
      workspaceId: 'ws_stripoo_primary',
      code: 'AICREDITS50',
      amountOffCents: 5000,
      duration: 'once',
      maxRedemptions: 1000,
      redeemedCount: 884,
      expiresAt: '2026-10-01T00:00:00Z',
    },
    {
      id: 'cpn_startup_free',
      workspaceId: 'ws_stripoo_primary',
      code: 'YCSTARTUP',
      percentOff: 100,
      duration: 'once',
      maxRedemptions: 50,
      redeemedCount: 31,
      expiresAt: '2026-11-30T00:00:00Z',
    },
  ];

  private ledgerAccounts: LedgerAccount[] = [
    { id: 'acc_1000', workspaceId: 'ws_stripoo_primary', code: '1000', name: 'Cash & Payment Clearing', type: 'ASSET' },
    { id: 'acc_1200', workspaceId: 'ws_stripoo_primary', code: '1200', name: 'Customer Prepaid Balance', type: 'LIABILITY' },
    { id: 'acc_2000', workspaceId: 'ws_stripoo_primary', code: '2000', name: 'Accounts Receivable', type: 'ASSET' },
    { id: 'acc_2100', workspaceId: 'ws_stripoo_primary', code: '2100', name: 'Sales Tax & VAT Payable', type: 'LIABILITY' },
    { id: 'acc_4000', workspaceId: 'ws_stripoo_primary', code: '4000', name: 'Subscription SaaS Revenue', type: 'REVENUE' },
    { id: 'acc_4100', workspaceId: 'ws_stripoo_primary', code: '4100', name: 'Usage-Based Metering Revenue', type: 'REVENUE' },
    { id: 'acc_5000', workspaceId: 'ws_stripoo_primary', code: '5000', name: 'Promotional Discounts & Coupons', type: 'EXPENSE' },
  ];

  private ledgerEntries: LedgerEntry[] = [
    {
      id: 'ent_01',
      transactionGroupId: 'tx_grp_0042',
      accountId: 'acc_1000',
      accountCode: '1000',
      accountName: 'Cash & Payment Clearing',
      direction: 'DEBIT',
      amountCents: 28372,
      referenceId: 'INV-2026-0042',
      createdAt: '2026-08-12T14:10:00Z',
    },
    {
      id: 'ent_02',
      transactionGroupId: 'tx_grp_0042',
      accountId: 'acc_5000',
      accountCode: '5000',
      accountName: 'Promotional Discounts',
      direction: 'DEBIT',
      amountCents: 5000,
      referenceId: 'INV-2026-0042',
      createdAt: '2026-08-12T14:10:00Z',
    },
    {
      id: 'ent_03',
      transactionGroupId: 'tx_grp_0042',
      accountId: 'acc_4000',
      accountCode: '4000',
      accountName: 'Subscription SaaS Revenue',
      direction: 'CREDIT',
      amountCents: 30900,
      referenceId: 'INV-2026-0042',
      createdAt: '2026-08-12T14:10:00Z',
    },
    {
      id: 'ent_04',
      transactionGroupId: 'tx_grp_0042',
      accountId: 'acc_2100',
      accountCode: '2100',
      accountName: 'Sales Tax & VAT Payable',
      direction: 'CREDIT',
      amountCents: 2472,
      referenceId: 'INV-2026-0042',
      createdAt: '2026-08-12T14:10:00Z',
    },
  ];

  private webhookEndpoints: WebhookEndpoint[] = [
    {
      id: 'we_01',
      workspaceId: 'ws_stripoo_primary',
      url: 'https://api.hyperai.io/webhooks/stripoo',
      events: ['invoice.paid', 'subscription.updated', 'usage.threshold_exceeded'],
      secret: 'whsec_client_hyperai_99120',
      enabled: true,
      createdAt: '2026-06-15T00:00:00Z',
    },
    {
      id: 'we_02',
      workspaceId: 'ws_stripoo_primary',
      url: 'https://hooks.vortexlabs.com/billing-events',
      events: ['invoice.created', 'invoice.paid'],
      secret: 'whsec_client_vortex_77182',
      enabled: true,
      createdAt: '2026-07-02T00:00:00Z',
    },
  ];

  private webhookDeliveries: WebhookDelivery[] = [
    {
      id: 'del_01HX1',
      endpointId: 'we_01',
      eventType: 'invoice.paid',
      payload: { invoice_id: 'in_01HX891', number: 'INV-2026-0042', amount_paid_cents: 28372 },
      statusCode: 200,
      latencyMs: 38,
      attempts: 1,
      success: true,
      signature: 't=1787768728,v1=9b82a3c749e1e2f8...',
      createdAt: '2026-08-26T23:20:00Z',
    },
    {
      id: 'del_01HX2',
      endpointId: 'we_01',
      eventType: 'usage.threshold_exceeded',
      payload: { customer_id: 'cus_01HX89A', event_name: 'llm_tokens', threshold: 1000000 },
      statusCode: 200,
      latencyMs: 44,
      attempts: 1,
      success: true,
      signature: 't=1787768735,v1=81a74e921b34c90...',
      createdAt: '2026-08-26T23:22:15Z',
    },
  ];

  private apiKeys: ApiKey[] = [
    {
      id: 'key_live_sec',
      workspaceId: 'ws_stripoo_primary',
      keyType: 'secret',
      keyHash: 'sk_live_9b82a3c749e1e2f8a847b2c918374921',
      name: 'Production Server SDK',
      environment: 'live',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'key_live_pub',
      workspaceId: 'ws_stripoo_primary',
      keyType: 'publishable',
      keyHash: 'pk_live_449281a8b7c3d2e1903482716a5b4c3d',
      name: 'Production Client Key',
      environment: 'live',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'key_test_sec',
      workspaceId: 'ws_stripoo_primary',
      keyType: 'secret',
      keyHash: 'sk_test_51Mz89Abc912093481283748291029384',
      name: 'Sandbox Test Secret',
      environment: 'test',
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];

  private payments: Payment[] = [
    {
      id: 'ch_3Mzx89Abc912093',
      workspaceId: 'ws_stripoo_primary',
      customerId: 'cus_01HX89A',
      amountCents: 245000,
      currency: 'USD',
      status: 'succeeded',
      paymentMethod: { brand: 'visa', last4: '4242' },
      description: 'Enterprise Scale Plan + Incurred Usage',
      receiptNumber: 'RCPT-2026-9041',
      isTest: false,
      createdAt: '2026-08-26T22:30:00Z',
    },
    {
      id: 'ch_3Mzx89Abc912094',
      workspaceId: 'ws_stripoo_primary',
      customerId: 'cus_01HX89D',
      amountCents: 9900,
      currency: 'USD',
      status: 'succeeded',
      paymentMethod: { brand: 'mastercard', last4: '8812' },
      description: 'Pro Subscription Renewal',
      receiptNumber: 'RCPT-2026-9042',
      isTest: false,
      createdAt: '2026-08-26T21:15:00Z',
    },
    {
      id: 'ch_3Mzx89Abc912095',
      workspaceId: 'ws_stripoo_primary',
      customerId: 'cus_01HX89B',
      amountCents: 3132,
      currency: 'USD',
      status: 'succeeded',
      paymentMethod: { brand: 'visa', last4: '5555' },
      description: 'Starter Developer Monthly',
      receiptNumber: 'RCPT-2026-9043',
      isTest: false,
      createdAt: '2026-08-25T14:40:00Z',
    },
    {
      id: 'ch_3Mzx89Abc912096',
      workspaceId: 'ws_stripoo_primary',
      customerId: 'cus_01HX89C',
      amountCents: 8500,
      currency: 'USD',
      status: 'refunded',
      refundedAmountCents: 8500,
      refundReason: 'Customer requested refund (duplicate charge)',
      paymentMethod: { brand: 'amex', last4: '1004' },
      description: 'API Metering Overcharge Adjustment',
      receiptNumber: 'RCPT-2026-9044',
      isTest: false,
      createdAt: '2026-08-24T09:12:00Z',
    },
    {
      id: 'ch_test_3Mzx89Abc912097',
      workspaceId: 'ws_stripoo_primary',
      customerId: 'cus_01HX89A',
      amountCents: 15000,
      currency: 'USD',
      status: 'succeeded',
      paymentMethod: { brand: 'visa', last4: '4242' },
      description: 'Sandbox Test Payment Verification',
      receiptNumber: 'RCPT-TEST-0001',
      isTest: true,
      createdAt: '2026-08-26T23:50:00Z',
    },
  ];

  // Public Query & Mutation Methods
  public getWorkspace() { return this.workspace; }
  public getCustomers() { return this.customers; }
  public getPlans() { return this.plans; }
  public getSubscriptions() {
    return this.subscriptions.map(sub => ({
      ...sub,
      customer: this.customers.find(c => c.id === sub.customerId),
      price: this.plans.flatMap(p => p.prices).find(pr => pr.id === sub.priceId),
    }));
  }
  public getUsageEvents() { return this.usageEvents; }
  public getInvoices() {
    return this.invoices.map(inv => ({
      ...inv,
      customer: this.customers.find(c => c.id === inv.customerId),
    }));
  }
  public getCoupons() { return this.coupons; }
  public getLedgerAccounts() { return this.ledgerAccounts; }
  public getLedgerEntries() { return this.ledgerEntries; }
  public getWebhookEndpoints() { return this.webhookEndpoints; }
  public getWebhookDeliveries() { return this.webhookDeliveries; }
  public getApiKeys() { return this.apiKeys; }

  public getPayments(isTest?: boolean): Payment[] {
    return this.payments
      .filter(p => isTest === undefined || p.isTest === isTest)
      .map(p => ({
        ...p,
        customer: this.customers.find(c => c.id === p.customerId),
      }));
  }

  public refundPayment(paymentId: string, reason: string): Payment | null {
    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment) return null;
    payment.status = 'refunded';
    payment.refundedAmountCents = payment.amountCents;
    payment.refundReason = reason;
    return payment;
  }

  public addCustomer(customer: Omit<Customer, 'id' | 'workspaceId' | 'balanceCents' | 'createdAt'>): Customer {
    const newCustomer: Customer = {
      ...customer,
      id: `cus_01HX${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      workspaceId: this.workspace.id,
      balanceCents: 0,
      createdAt: new Date().toISOString(),
    };
    this.customers.unshift(newCustomer);
    return newCustomer;
  }

  public addUsageEvent(event: Omit<UsageEvent, 'id' | 'workspaceId' | 'timestamp'>): UsageEvent {
    const customer = this.customers.find(c => c.id === event.customerId);
    const newEvent: UsageEvent = {
      ...event,
      id: `evt_01HX${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      workspaceId: this.workspace.id,
      timestamp: new Date().toISOString(),
      customerName: customer?.name || 'Unknown Customer',
    };
    this.usageEvents.unshift(newEvent);
    if (this.usageEvents.length > 50) this.usageEvents.pop();
    return newEvent;
  }

  public addSubscription(sub: Omit<Subscription, 'id' | 'workspaceId' | 'createdAt'>): Subscription {
    const newSub: Subscription = {
      ...sub,
      id: `sub_01HX${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      workspaceId: this.workspace.id,
      createdAt: new Date().toISOString(),
    };
    this.subscriptions.unshift(newSub);
    return newSub;
  }

  public addCoupon(coupon: Omit<Coupon, 'id' | 'workspaceId' | 'redeemedCount' | 'createdAt'>): Coupon {
    const newCoupon: Coupon = {
      ...coupon,
      id: `cpn_${coupon.code.toLowerCase()}_${Math.random().toString(36).substring(2, 5)}`,
      workspaceId: this.workspace.id,
      redeemedCount: 0,
    };
    this.coupons.unshift(newCoupon);
    return newCoupon;
  }

  public addWebhookDelivery(delivery: Omit<WebhookDelivery, 'id' | 'createdAt'>): WebhookDelivery {
    const newDelivery: WebhookDelivery = {
      ...delivery,
      id: `del_01HX${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    };
    this.webhookDeliveries.unshift(newDelivery);
    if (this.webhookDeliveries.length > 30) this.webhookDeliveries.pop();
    return newDelivery;
  }

  public recordLedgerTransaction(entries: Omit<LedgerEntry, 'id' | 'createdAt'>[]) {
    const now = new Date().toISOString();
    for (const ent of entries) {
      this.ledgerEntries.unshift({
        ...ent,
        id: `ent_01HX${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        createdAt: now,
      });
    }
  }

  public addInvoice(invoice: {
    customerId: string;
    description: string;
    amountCents: number;
  }): Invoice {
    const customer = this.customers.find((c) => c.id === invoice.customerId);
    const invoiceNumber = `INV-2026-${Math.floor(Math.random() * 9000) + 1000}`;
    const taxCents = Math.round(invoice.amountCents * 0.08);
    const totalCents = invoice.amountCents + taxCents;

    const newInvoice: Invoice = {
      id: `in_01HX${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      workspaceId: this.workspace.id,
      customerId: invoice.customerId,
      invoiceNumber,
      status: 'open',
      subtotalCents: invoice.amountCents,
      taxCents,
      discountCents: 0,
      totalCents,
      currency: 'USD',
      dueDate: new Date(Date.now() + 86400000 * 30).toISOString(),
      createdAt: new Date().toISOString(),
      customer,
      items: [
        {
          id: `ii_${Date.now()}`,
          invoiceId: `in_01HX${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          description: invoice.description,
          quantity: 1,
          unitAmountCents: invoice.amountCents,
          totalAmountCents: invoice.amountCents,
        },
      ],
    };

    this.invoices.unshift(newInvoice);
    return newInvoice;
  }

  public adjustCustomerBalance(customerId: string, deltaCents: number): Customer | null {
    const customer = this.customers.find((c) => c.id === customerId);
    if (!customer) return null;
    customer.balanceCents += deltaCents;

    // Book accounting journal entry for prepaid account credit
    this.recordLedgerTransaction([
      {
        transactionGroupId: `tx_credit_${Date.now()}`,
        accountId: 'acc_1000',
        accountCode: '1000',
        accountName: 'Cash & Payment Clearing',
        direction: 'DEBIT',
        amountCents: Math.abs(deltaCents),
        referenceId: customerId,
      },
      {
        transactionGroupId: `tx_credit_${Date.now()}`,
        accountId: 'acc_1200',
        accountCode: '1200',
        accountName: 'Customer Prepaid Balance',
        direction: 'CREDIT',
        amountCents: Math.abs(deltaCents),
        referenceId: customerId,
      },
    ]);

    return customer;
  }
}

// Global Singleton for Next.js API Routes & UI State
const globalStoreKey = Symbol.for('stripoo.data.store.v2');
const globalForStore = globalThis as unknown as { [globalStoreKey]: StripooDataStore };

export const store = globalForStore[globalStoreKey] || new StripooDataStore();
if (process.env.NODE_ENV !== 'production') globalForStore[globalStoreKey] = store;
