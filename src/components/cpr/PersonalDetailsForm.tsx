'use client';

import React, { useState } from 'react';
import { PersonalDetailsData } from '@/types/cpr';
import { Lock } from 'lucide-react';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

interface PersonalDetailsFormProps {
  initialData: PersonalDetailsData;
  onSubmit: (data: PersonalDetailsData) => void;
  isLoading?: boolean;
  onSelectSampleInstructor?: (name: string) => void;
}

export function PersonalDetailsForm({
  initialData,
  onSubmit,
  isLoading = false,
  onSelectSampleInstructor,
}: PersonalDetailsFormProps) {
  const [formData, setFormData] = useState<PersonalDetailsData>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof PersonalDetailsData, string>>>({});

  const handleChange = (field: keyof PersonalDetailsData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Partial<Record<keyof PersonalDetailsData, string>> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required.';
    if (!formData.email.trim()) newErrors.email = 'Email Address is required.';
    if (!formData.phone.trim()) newErrors.phone = 'Phone Number is required.';
    if (!formData.fullAddress.trim()) newErrors.fullAddress = 'Address is required.';
    if (!formData.city.trim()) newErrors.city = 'City is required.';
    if (!formData.state.trim()) newErrors.state = 'State is required.';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip Code is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg border border-slate-200/80 overflow-hidden">
      {/* Top Tabs - Personal Information & Checkout Details (Inactive/Disabled) */}
      <div className="border-b border-slate-200 flex items-stretch text-center font-semibold text-[13px] sm:text-[14px]">
        {/* Step 1: Personal Information */}
        <div className="flex-1 py-3 px-4 text-[#0070f3] border-b-2 border-[#0070f3] bg-white">
          <span className="block font-bold text-slate-800">Personal</span>
          <span className="text-[11px] text-slate-500 font-normal">Information</span>
        </div>

        <div className="w-px bg-slate-200 my-2" />

        {/* Step 2: Checkout Details (Disabled / Crossed Out as requested) */}
        <div className="flex-1 py-3 px-4 text-slate-400 bg-slate-50/50 cursor-not-allowed select-none relative overflow-hidden">
          <div className="opacity-60 line-through">
            <span className="block font-semibold">Checkout</span>
            <span className="text-[11px] font-normal">Details</span>
          </div>
          {/* Subtle red indicator badge showing step is skipped for now */}
          <span className="absolute top-1 right-2 text-[9px] font-bold text-rose-500 uppercase tracking-tighter">
            (Step #2 Next)
          </span>
        </div>
      </div>

      {/* Form Fields matching Image 2 */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-4">
        {/* Full Name */}
        <div>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            placeholder="Full Name..."
            className={`w-full px-3.5 py-2.5 rounded-md border text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all ${
              errors.fullName ? 'border-red-400 bg-red-50/30' : 'border-slate-300 bg-white'
            }`}
          />
          {errors.fullName && (
            <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.fullName}</p>
          )}

          {/* Quick Helper for Demo / Testing */}
          {onSelectSampleInstructor && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
              <span>Quick Test:</span>
              <button
                type="button"
                onClick={() => {
                  handleChange('fullName', 'Aaron McDonald');
                  onSelectSampleInstructor('Aaron McDonald');
                }}
                className="text-cyan-700 hover:text-cyan-900 underline font-medium cursor-pointer"
              >
                Aaron McDonald (Active - 5 Cards)
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  handleChange('fullName', 'Alicia Moore');
                  onSelectSampleInstructor('Alicia Moore');
                }}
                className="text-cyan-700 hover:text-cyan-900 underline font-medium cursor-pointer"
              >
                Alicia Moore (Active - BLS only)
              </button>
            </div>
          )}
        </div>

        {/* Email Address */}
        <div>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Email Address..."
            className={`w-full px-3.5 py-2.5 rounded-md border text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all ${
              errors.email ? 'border-red-400 bg-red-50/30' : 'border-slate-300 bg-white'
            }`}
          />
          {errors.email && (
            <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.email}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="Phone Number..."
            className={`w-full px-3.5 py-2.5 rounded-md border text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all ${
              errors.phone ? 'border-red-400 bg-red-50/30' : 'border-slate-300 bg-white'
            }`}
          />
          {errors.phone && (
            <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.phone}</p>
          )}
        </div>

        {/* ADDRESS Divider Label */}
        <div className="pt-2">
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            ADDRESS
          </span>
        </div>

        {/* Full Address */}
        <div>
          <input
            type="text"
            value={formData.fullAddress}
            onChange={(e) => handleChange('fullAddress', e.target.value)}
            placeholder="Full Address..."
            className={`w-full px-3.5 py-2.5 rounded-md border text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all ${
              errors.fullAddress ? 'border-red-400 bg-red-50/30' : 'border-slate-300 bg-white'
            }`}
          />
          {errors.fullAddress && (
            <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.fullAddress}</p>
          )}
        </div>

        {/* City Name */}
        <div>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="City Name..."
            className={`w-full px-3.5 py-2.5 rounded-md border text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all ${
              errors.city ? 'border-red-400 bg-red-50/30' : 'border-slate-300 bg-white'
            }`}
          />
          {errors.city && (
            <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.city}</p>
          )}
        </div>

        {/* 3-Column Country, State, Zip Row matching Screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Country */}
          <div>
            <input
              type="text"
              readOnly
              value={formData.country || 'United States'}
              className="w-full px-3 py-2.5 rounded-md border border-slate-300 bg-slate-50 text-[13px] text-slate-700 cursor-not-allowed font-medium"
            />
          </div>

          {/* State / Province */}
          <div>
            <select
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              className={`w-full px-2.5 py-2.5 rounded-md border text-[13px] text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all cursor-pointer ${
                errors.state ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
              }`}
            >
              <option value="">Select State / Province</option>
              {US_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="text-[10px] text-red-500 mt-0.5 font-medium">{errors.state}</p>
            )}
          </div>

          {/* Zip Code */}
          <div>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              placeholder="Zip Code..."
              className={`w-full px-3 py-2.5 rounded-md border text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all ${
                errors.zipCode ? 'border-red-400 bg-red-50/30' : 'border-slate-300 bg-white'
              }`}
            />
            {errors.zipCode && (
              <p className="text-[10px] text-red-500 mt-0.5 font-medium">{errors.zipCode}</p>
            )}
          </div>
        </div>

        {/* Go To Step #2 Button matching bright blue in Image 2 */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-md bg-[#1877f2] hover:bg-[#166fe5] active:bg-[#1465d2] text-white text-[15px] font-bold transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Verifying Instructor Status...</span>
              </>
            ) : (
              <span>Go To Step #2</span>
            )}
          </button>
        </div>

        {/* Privacy Assurance text matching Image 2 */}
        <div className="text-center pt-1 flex items-center justify-center gap-1.5 text-[12px] text-slate-500 font-normal">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>We Respect Your Privacy & Information.</span>
        </div>
      </form>
    </div>
  );
}
