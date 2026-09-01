// ============================================================================
// STRIPOO - CONTINUOUS TO-THE-SECOND PRORATION CALCULATOR
// ============================================================================
// Calculates exact credits/charges when switching plans or quantities mid-cycle.

export interface ProrationParams {
  currentPlanAmountCents: number;
  newPlanAmountCents: number;
  periodStart: Date;
  periodEnd: Date;
  switchTimestamp?: Date;
}

export interface ProrationResult {
  totalSecondsInCycle: number;
  usedSeconds: number;
  remainingSeconds: number;
  unusedCurrentPlanCreditCents: number;
  proratedNewPlanChargeCents: number;
  netAdjustmentCents: number; // Positive = customer owes difference; Negative = credit applied to balance
  explanation: string;
}

export class ProrationCalculator {
  public static calculate(params: ProrationParams): ProrationResult {
    const now = params.switchTimestamp || new Date();
    const startMs = params.periodStart.getTime();
    const endMs = params.periodEnd.getTime();
    const currentMs = Math.min(Math.max(now.getTime(), startMs), endMs);

    const totalSecondsInCycle = Math.max(1, Math.floor((endMs - startMs) / 1000));
    const usedSeconds = Math.floor((currentMs - startMs) / 1000);
    const remainingSeconds = totalSecondsInCycle - usedSeconds;

    const remainingFraction = remainingSeconds / totalSecondsInCycle;

    // Unused credit from the old plan
    const unusedCurrentPlanCreditCents = Math.round(params.currentPlanAmountCents * remainingFraction);

    // Charge for the remainder of the cycle on the new plan
    const proratedNewPlanChargeCents = Math.round(params.newPlanAmountCents * remainingFraction);

    // Net difference
    const netAdjustmentCents = proratedNewPlanChargeCents - unusedCurrentPlanCreditCents;

    const formattedCredit = `$${(unusedCurrentPlanCreditCents / 100).toFixed(2)}`;
    const formattedCharge = `$${(proratedNewPlanChargeCents / 100).toFixed(2)}`;
    const formattedNet = `$${(Math.abs(netAdjustmentCents) / 100).toFixed(2)}`;

    const explanation =
      netAdjustmentCents >= 0
        ? `Customer credited ${formattedCredit} for unused cycle time and charged ${formattedCharge} for upgraded plan. Net due today: ${formattedNet}.`
        : `Customer credited ${formattedCredit} for unused cycle time and charged ${formattedCharge} for downgraded plan. Net credit to balance: ${formattedNet}.`;

    return {
      totalSecondsInCycle,
      usedSeconds,
      remainingSeconds,
      unusedCurrentPlanCreditCents,
      proratedNewPlanChargeCents,
      netAdjustmentCents,
      explanation,
    };
  }
}
