'use client';

import React, { useState } from 'react';
import {
  ECardCode,
  InstructorRecord,
  TaxExemptChoice,
  PersonalDetailsData,
} from '@/types/cpr';
import { ECARD_CATALOG } from '@/data/instructor-database';
import {
  CheckCircle,
  ShieldCheck,
  CreditCard,
  ArrowLeft,
  ShoppingBag,
  Plus,
  Minus,
  Sparkles,
  Info,
} from 'lucide-react';

interface AuthorizedECardsViewProps {
  instructor: InstructorRecord;
  personalDetails: PersonalDetailsData;
  taxChoice: TaxExemptChoice;
  onBackToPersonalDetails: () => void;
  onProceedToCheckout?: (cart: Record<ECardCode, number>, total: number) => void;
}

export function AuthorizedECardsView({
  instructor,
  personalDetails,
  taxChoice,
  onBackToPersonalDetails,
  onProceedToCheckout,
}: AuthorizedECardsViewProps) {
  // Filter only authorized cards where checkmark is true in Excel sheet
  const authorizedCodes = (Object.keys(instructor.authorizedCards) as ECardCode[]).filter(
    (code) => instructor.authorizedCards[code] === true
  );

  // Initialize quantities (default 1 for the first authorized card, 0 for rest)
  const [quantities, setQuantities] = useState<Record<ECardCode, number>>(() => {
    const initial: Record<string, number> = {};
    authorizedCodes.forEach((code, index) => {
      initial[code] = index === 0 ? 5 : 0;
    });
    return initial as Record<ECardCode, number>;
  });

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  const updateQuantity = (code: ECardCode, delta: number) => {
    setQuantities((prev) => {
      const current = prev[code] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [code]: next };
    });
  };

  const setExactQuantity = (code: ECardCode, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [code]: Math.max(0, Math.min(500, value || 0)),
    }));
  };

  // Calculations
  const TAX_RATE = 0.07; // 7% standard sales tax if non-exempt
  const subtotal = authorizedCodes.reduce((sum, code) => {
    const qty = quantities[code] || 0;
    const price = ECARD_CATALOG[code]?.unitPrice || 20;
    return sum + qty * price;
  }, 0);

  const totalCardsCount = authorizedCodes.reduce(
    (sum, code) => sum + (quantities[code] || 0),
    0
  );

  const isExempt = taxChoice === 'yes';
  const taxAmount = isExempt ? 0 : subtotal * TAX_RATE;
  const grandTotal = subtotal + taxAmount;

  const handleProceed = () => {
    if (totalCardsCount === 0) {
      alert('Please select at least 1 eCard to continue.');
      return;
    }
    if (onProceedToCheckout) {
      onProceedToCheckout(quantities, grandTotal);
    } else {
      setCheckoutModalOpen(true);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* Top Instructor Status Verification Banner */}
      <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-sky-50 border border-teal-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {instructor.name}
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                Active Instructor
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Email: <span className="font-medium text-slate-800">{personalDetails.email}</span> • Phone: <span className="font-medium text-slate-800">{personalDetails.phone}</span>
            </p>
          </div>
        </div>

        {/* Tax Status Pill */}
        <div className="flex flex-col sm:items-end text-left sm:text-right">
          <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
            Tax Exemption Status
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold mt-1 ${
              isExempt
                ? 'bg-teal-100 text-teal-800 border border-teal-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            {isExempt ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Tax Exempt (0% Tax Applied)
              </>
            ) : (
              <>
                <Info className="w-3.5 h-3.5 text-amber-600" />
                Non-Tax Exempt (Standard Tax Applies)
              </>
            )}
          </span>
        </div>
      </div>

      {/* Main Grid: Authorized eCards on Left, Order Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Authorized eCards (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Authorized eCards Selection
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Showing <strong>{authorizedCodes.length}</strong> certified eCard disciplines authorized in the TheCPRPro roster for your account.
              </p>
            </div>

            <button
              onClick={onBackToPersonalDetails}
              className="text-xs font-semibold text-cyan-700 hover:text-cyan-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Edit Personal Info
            </button>
          </div>

          {/* Cards List */}
          <div className="space-y-3.5">
            {authorizedCodes.map((code) => {
              const cardDef = ECARD_CATALOG[code];
              const qty = quantities[code] || 0;
              const cardTotal = qty * (cardDef?.unitPrice || 20);

              return (
                <div
                  key={code}
                  className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 ${
                    qty > 0
                      ? 'border-cyan-500/70 bg-cyan-50/20 shadow-xs ring-1 ring-cyan-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Card Title & Info */}
                    <div className="space-y-1 max-w-md">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-900 text-white tracking-wider">
                          {code}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {cardDef?.category}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Authorized ✓
                        </span>
                      </div>

                      <h4 className="text-[15px] font-bold text-slate-900">
                        {cardDef?.title || code}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {cardDef?.description}
                      </p>
                    </div>

                    {/* Price & Quantity Controls */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <div className="text-[15px] font-bold text-slate-900">
                          ${cardDef?.unitPrice.toFixed(2)}
                          <span className="text-xs font-normal text-slate-500"> / card</span>
                        </div>
                        {qty > 0 && (
                          <div className="text-[11px] font-semibold text-cyan-700">
                            Sub: ${cardTotal.toFixed(2)}
                          </div>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center rounded-lg border border-slate-300 bg-white shadow-2xs overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(code, -1)}
                          disabled={qty <= 0}
                          className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={500}
                          value={qty}
                          onChange={(e) =>
                            setExactQuantity(code, parseInt(e.target.value, 10))
                          }
                          className="w-12 h-8 text-center text-xs font-bold text-slate-900 focus:outline-none border-x border-slate-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateQuantity(code, 1)}
                          className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Order Summary Card (4 cols) */}
        <div className="lg:col-span-4 sticky top-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-cyan-400" />
                <h4 className="font-bold text-[15px]">eCards Order Summary</h4>
              </div>
              <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full font-medium">
                {totalCardsCount} cards
              </span>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Selected List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {totalCardsCount === 0 ? (
                  <p className="text-xs text-slate-400 italic py-3 text-center">
                    No eCards selected yet. Increase quantity on any authorized card.
                  </p>
                ) : (
                  authorizedCodes
                    .filter((code) => (quantities[code] || 0) > 0)
                    .map((code) => (
                      <div
                        key={code}
                        className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0"
                      >
                        <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                          <span className="font-bold text-slate-800 truncate">
                            {code}
                          </span>
                          <span className="text-slate-400">× {quantities[code]}</span>
                        </div>
                        <span className="font-semibold text-slate-900">
                          $
                          {(
                            (quantities[code] || 0) *
                            (ECARD_CATALOG[code]?.unitPrice || 20)
                          ).toFixed(2)}
                        </span>
                      </div>
                    ))
                )}
              </div>

              <div className="border-t border-slate-200 pt-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Tax row with Tax Exempt logic */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-600">Estimated Tax</span>
                    {isExempt && (
                      <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.2 rounded">
                        Exempt
                      </span>
                    )}
                  </div>
                  <span
                    className={`font-semibold ${
                      isExempt ? 'text-teal-700' : 'text-slate-900'
                    }`}
                  >
                    {isExempt ? '$0.00 (Exempt)' : `$${taxAmount.toFixed(2)}`}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-base font-bold text-slate-900">
                  <span>Total Due</span>
                  <span className="text-xl text-[#0070f3]">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Proceed to Checkout CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleProceed}
                  disabled={totalCardsCount === 0}
                  className="w-full py-3 px-4 rounded-xl bg-[#0070f3] hover:bg-[#0060df] active:bg-[#0051bf] disabled:opacity-50 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Checkout</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center leading-tight">
                Tax exemption status was verified on step #1. Immediate eCard delivery upon checkout completion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder Modal for Checkout Screenshot Handover */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 mx-auto flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Ready for Checkout Form!
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Total Order: <strong>${grandTotal.toFixed(2)}</strong> for {totalCardsCount} eCards.
              <br />
              Tax Status: <strong>{isExempt ? 'Tax Exempt ($0 Tax)' : 'Non-Tax (Tax Included)'}</strong>.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
              Please provide the checkout form screenshot as mentioned, and we will integrate the checkout step and final thank you page!
            </div>
            <button
              onClick={() => setCheckoutModalOpen(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
