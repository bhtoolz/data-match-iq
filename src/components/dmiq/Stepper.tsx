'use client';

import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { WorkflowStage } from '@/types/data-match-iq';

interface StepperProps {
  currentStage: WorkflowStage;
  onNavigateStage: (stage: WorkflowStage) => void;
  highestCompletedStage: number;
}

/**
 * 3-Stage Stepper Navigation adhering to McGrath PRD §4 & Prototype design.
 * Stage 1: Prepare data (Upload + Map fields)
 * Stage 2: Check issues (Validate addresses + Match processing)
 * Stage 3: Results (Results call list + CSV export)
 */
export function Stepper({ currentStage, onNavigateStage, highestCompletedStage }: StepperProps) {
  // Map current sub-stage to the 3 main user-facing steps
  let activeStep = 1;
  if (currentStage === 'upload' || currentStage === 'map-fields') activeStep = 1;
  else if (currentStage === 'validate' || currentStage === 'match') activeStep = 2;
  else if (currentStage === 'results') activeStep = 3;

  const steps = [
    {
      stepNumber: 1,
      title: 'Prepare data',
      stageTarget: 'upload' as WorkflowStage,
      isCompleted: highestCompletedStage >= 1 && activeStep > 1,
      isActive: activeStep === 1,
      canNavigate: activeStep > 1,
    },
    {
      stepNumber: 2,
      title: 'Check issues',
      stageTarget: 'validate' as WorkflowStage,
      isCompleted: highestCompletedStage >= 2 && activeStep > 2,
      isActive: activeStep === 2,
      canNavigate: highestCompletedStage >= 1 && activeStep !== 2,
    },
    {
      stepNumber: 3,
      title: 'Results',
      stageTarget: 'results' as WorkflowStage,
      isCompleted: highestCompletedStage >= 3,
      isActive: activeStep === 3,
      canNavigate: highestCompletedStage >= 2 && activeStep !== 3,
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      <div className="bg-white border border-[#e6e4df] rounded-xl px-4 sm:px-6 py-2.5 shadow-xs">
        <nav aria-label="Progress">
          <ol className="flex items-center w-full justify-between">
            {steps.map((step, idx) => {
              const isLast = idx === steps.length - 1;

              return (
                <React.Fragment key={step.stepNumber}>
                  <li className="flex items-center flex-1 justify-start">
                    <button
                      type="button"
                      disabled={!step.canNavigate}
                      onClick={() => step.canNavigate && onNavigateStage(step.stageTarget)}
                      className={`group flex items-center gap-2.5 sm:gap-3 text-left transition-colors py-1 px-2 rounded-md ${
                        step.canNavigate ? 'cursor-pointer hover:bg-[#f4f3f0]' : 'cursor-default'
                      }`}
                    >
                      {/* Step Number Circle */}
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                          step.isActive
                            ? 'bg-[#0f3d52] text-white ring-4 ring-[#e5ebf0]'
                            : step.isCompleted
                            ? 'bg-[#1f6b3e] text-white'
                            : 'bg-[#f4f3f0] text-[#8a8f98] border border-[#d0cdc6]'
                        }`}
                      >
                        {step.isCompleted ? (
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : (
                          step.stepNumber
                        )}
                      </span>

                      {/* Step Title */}
                      <span
                        className={`text-xs sm:text-sm font-medium ${
                          step.isActive
                            ? 'text-[#0f3d52] font-semibold'
                            : step.isCompleted
                            ? 'text-[#1a1c20]'
                            : 'text-[#8a8f98]'
                        }`}
                      >
                        {step.title}
                      </span>
                    </button>
                  </li>

                  {/* Separator Arrow */}
                  {!isLast && (
                    <div className="flex items-center px-2 sm:px-4 shrink-0 text-[#d0cdc6]">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
