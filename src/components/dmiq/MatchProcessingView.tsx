'use client';

import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle2, Loader2, AlertCircle, Ban } from 'lucide-react';
import { ValidationRow, MatchResult } from '@/types/data-match-iq';
import { matchRowAgainstAgentbox } from '@/lib/agentbox-matcher';

interface MatchProcessingViewProps {
  validationRows: ValidationRow[];
  onMatchComplete: (results: MatchResult[]) => void;
  onCancelMatch: () => void;
}

const STAGES = [
  'Preparing uploaded data',
  'Finding Agentbox candidates',
  'Comparing addresses',
  'Creating review results',
];

/**
 * Stage 2 Transient: Async Agentbox Match Processing Screen.
 * Demonstrates the 4 ordered backend matching stages with live progress,
 * error tracking, and cancel match capability.
 */
export function MatchProcessingView({
  validationRows,
  onMatchComplete,
  onCancelMatch,
}: MatchProcessingViewProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const isCancelledRef = useRef(false);

  const totalRecords = validationRows.length;
  const progressPercent = totalRecords > 0 ? Math.min(100, Math.round((processedCount / totalRecords) * 100)) : 0;

  useEffect(() => {
    isCancelledRef.current = false;
    let isMounted = true;

    const runMatchingJob = async () => {
      // Stage 1: Preparing data
      if (!isMounted || isCancelledRef.current) return;
      setCurrentStageIndex(0);
      await new Promise((r) => setTimeout(r, 400));

      // Stage 2: Finding Agentbox candidates
      if (!isMounted || isCancelledRef.current) return;
      setCurrentStageIndex(1);
      await new Promise((r) => setTimeout(r, 500));

      // Stage 3: Comparing addresses in chunks
      if (!isMounted || isCancelledRef.current) return;
      setCurrentStageIndex(2);

      const calculatedResults: MatchResult[] = [];
      const chunkSize = Math.max(1, Math.ceil(totalRecords / 10));

      for (let i = 0; i < totalRecords; i += chunkSize) {
        if (!isMounted || isCancelledRef.current) return;

        const slice = validationRows.slice(i, i + chunkSize);
        slice.forEach((row) => {
          try {
            const res = matchRowAgainstAgentbox(row);
            calculatedResults.push(res);
          } catch (e) {
            setErrorCount((prev) => prev + 1);
          }
        });

        setProcessedCount(Math.min(totalRecords, i + slice.length));
        await new Promise((r) => setTimeout(r, 100));
      }

      // Stage 4: Creating review results
      if (!isMounted || isCancelledRef.current) return;
      setCurrentStageIndex(3);
      await new Promise((r) => setTimeout(r, 350));

      if (isMounted && !isCancelledRef.current) {
        onMatchComplete(calculatedResults);
      }
    };

    runMatchingJob();

    return () => {
      isMounted = false;
    };
  }, [validationRows, onMatchComplete, totalRecords]);

  const handleConfirmCancel = () => {
    isCancelledRef.current = true;
    setIsCancelConfirmOpen(false);
    onCancelMatch();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Title */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-[#1a1c20] tracking-tight">
          Matching records against Agentbox
        </h1>
        <p className="text-sm text-[#4d5158]">
          Cross-referencing normalised addresses with McGrath CRM contacts.
        </p>
      </div>

      {/* Progress Card */}
      <div className="bg-white border border-[#e6e4df] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Top Metric Strip */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#4d5158]">
              Current Stage
            </div>
            <div className="text-base font-bold text-[#0f3d52] flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {STAGES[currentStageIndex]}
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-extrabold text-[#1a1c20] font-mono">
              {progressPercent}%
            </div>
            <div className="text-[11px] text-[#8a8f98]">
              {errorCount === 0 ? '0 errors' : `${errorCount} processing error(s)`}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-2.5 bg-[#f4f3f0] rounded-full overflow-hidden border border-[#e6e4df]">
            <div
              className="h-full bg-[#0f3d52] transition-all duration-150 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-[#4d5158] font-mono">
            <span>Processed {processedCount} of {totalRecords} records</span>
            <span>{totalRecords - processedCount} remaining</span>
          </div>
        </div>

        {/* 4 Ordered Stages Checklist */}
        <div className="pt-2 border-t border-[#e6e4df] space-y-3">
          {STAGES.map((stageName, idx) => {
            const isDone = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div
                key={stageName}
                className="flex items-center justify-between text-xs py-1"
              >
                <div className="flex items-center gap-2.5">
                  {isDone ? (
                    <span className="w-5 h-5 rounded-full bg-[#e4f0e9] text-[#1f6b3e] flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  ) : isCurrent ? (
                    <span className="w-5 h-5 rounded-full bg-[#e5ebf0] text-[#0f3d52] flex items-center justify-center">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-[#f4f3f0] text-[#d0cdc6] flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d0cdc6]" />
                    </span>
                  )}

                  <span
                    className={`font-medium ${
                      isCurrent
                        ? 'text-[#0f3d52] font-semibold'
                        : isDone
                        ? 'text-[#1a1c20]'
                        : 'text-[#8a8f98]'
                    }`}
                  >
                    {stageName}
                  </span>
                </div>

                <span className="text-[11px] font-mono text-[#8a8f98]">
                  {isDone ? 'Completed' : isCurrent ? 'Processing...' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Cancel Matching Action */}
        <div className="pt-4 border-t border-[#e6e4df] flex items-center justify-center">
          <button
            type="button"
            onClick={() => setIsCancelConfirmOpen(true)}
            className="dmiq-btn-text text-xs text-[#b22a2a] hover:bg-[#f9e2e2]"
          >
            <Ban className="w-3.5 h-3.5" />
            Cancel matching
          </button>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {isCancelConfirmOpen && (
        <div className="fixed inset-0 bg-[#1a1c20]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-[#e6e4df] max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#f9e2e2] text-[#b22a2a] flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-[#1a1c20]">
                  Cancel Agentbox match run?
                </h3>
                <p className="text-xs text-[#4d5158] leading-relaxed">
                  Stopping the matching job will halt the current comparison. You will return to the Check Issues screen where you can inspect records or restart matching.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelConfirmOpen(false)}
                className="dmiq-btn-secondary text-xs"
              >
                Resume matching
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="dmiq-btn-primary bg-[#b22a2a] hover:bg-[#8f2121] text-xs"
              >
                Cancel match job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
