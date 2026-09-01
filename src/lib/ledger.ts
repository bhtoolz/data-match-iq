// ============================================================================
// STRIPOO - DOUBLE-ENTRY LEDGER & FINANCIAL INTEGRITY SERVICE
// ============================================================================
// Enforces mathematical balance: Sum(Debits) - Sum(Credits) === 0

import { store } from './data-store';
import { LedgerEntry } from './types';

export interface LedgerTransactionItem {
  accountCode: string;
  accountName: string;
  direction: 'DEBIT' | 'CREDIT';
  amountCents: number;
}

export class DoubleEntryLedgerService {
  /**
   * Validates and posts a balanced journal entry bundle.
   * Throws an invariant error if Debits !== Credits.
   */
  public static postJournalEntry(
    referenceId: string,
    items: LedgerTransactionItem[]
  ): { transactionGroupId: string; entriesCount: number; isBalanced: boolean } {
    let totalDebits = 0;
    let totalCredits = 0;

    for (const item of items) {
      if (item.amountCents < 0) {
        throw new Error(`Negative amounts not permitted in double-entry ledger: ${item.amountCents}`);
      }
      if (item.direction === 'DEBIT') {
        totalDebits += item.amountCents;
      } else if (item.direction === 'CREDIT') {
        totalCredits += item.amountCents;
      }
    }

    if (totalDebits !== totalCredits) {
      throw new Error(
        `Financial Invariant Violation: Total Debits ($${(totalDebits / 100).toFixed(
          2
        )}) do not match Total Credits ($${(totalCredits / 100).toFixed(2)})`
      );
    }

    const transactionGroupId = `tx_grp_${Math.random().toString(36).substring(2, 9)}`;
    const accounts = store.getLedgerAccounts();

    const preparedEntries: Omit<LedgerEntry, 'id' | 'createdAt'>[] = items.map((item) => {
      const acc = accounts.find((a) => a.code === item.accountCode) || {
        id: `acc_${item.accountCode}`,
        workspaceId: 'ws_stripoo_primary',
        code: item.accountCode,
        name: item.accountName,
        type: item.direction === 'DEBIT' ? 'ASSET' : 'REVENUE',
      };

      return {
        transactionGroupId,
        accountId: acc.id,
        accountCode: item.accountCode,
        accountName: item.accountName,
        direction: item.direction,
        amountCents: item.amountCents,
        referenceId,
      };
    });

    store.recordLedgerTransaction(preparedEntries);

    return {
      transactionGroupId,
      entriesCount: preparedEntries.length,
      isBalanced: true,
    };
  }

  /**
   * Helper to book a standard Subscription Payment with Tax and Coupon.
   */
  public static recordInvoicePayment(
    invoiceNumber: string,
    subtotalCents: number,
    taxCents: number,
    discountCents: number,
    netCollectedCents: number
  ) {
    const journalItems: LedgerTransactionItem[] = [
      {
        accountCode: '1000',
        accountName: 'Cash & Payment Clearing',
        direction: 'DEBIT',
        amountCents: netCollectedCents,
      },
    ];

    if (discountCents > 0) {
      journalItems.push({
        accountCode: '5000',
        accountName: 'Promotional Discounts & Coupons',
        direction: 'DEBIT',
        amountCents: discountCents,
      });
    }

    journalItems.push({
      accountCode: '4000',
      accountName: 'Subscription SaaS Revenue',
      direction: 'CREDIT',
      amountCents: subtotalCents,
    });

    if (taxCents > 0) {
      journalItems.push({
        accountCode: '2100',
        accountName: 'Sales Tax & VAT Payable',
        direction: 'CREDIT',
        amountCents: taxCents,
      });
    }

    return this.postJournalEntry(invoiceNumber, journalItems);
  }
}
