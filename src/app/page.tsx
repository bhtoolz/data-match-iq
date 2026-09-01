'use client';

import React, { useState, useCallback } from 'react';
import {
  WorkflowStage,
  UploadedFileSummary,
  ColumnMapping,
  ValidationRow,
  MatchResult,
} from '@/types/data-match-iq';
import { Header } from '@/components/dmiq/Header';
import { Stepper } from '@/components/dmiq/Stepper';
import { UploadView } from '@/components/dmiq/UploadView';
import { MapFieldsView } from '@/components/dmiq/MapFieldsView';
import { ValidateView } from '@/components/dmiq/ValidateView';
import { MatchProcessingView } from '@/components/dmiq/MatchProcessingView';
import { ResultsView } from '@/components/dmiq/ResultsView';
import { validateAndNormaliseRow } from '@/lib/australian-address-normalizer';

/**
 * Data Match IQ — Main Application Controller
 *
 * Coordinates the full 3-Stage Guided Workflow:
 *  - Stage 1: Prepare data (/ and /map-fields)
 *  - Stage 2: Check issues (/validate and /match)
 *  - Stage 3: Results (/results)
 */
export default function DataMatchIQApp() {
  // Navigation & Workflow Stage State
  const [stage, setStage] = useState<WorkflowStage>('upload');
  const [highestCompletedStage, setHighestCompletedStage] = useState<number>(0);

  // File & Data State
  const [fileSummary, setFileSummary] = useState<UploadedFileSummary | null>(null);
  const [mappings, setMappings] = useState<ColumnMapping>({});
  const [validationRows, setValidationRows] = useState<ValidationRow[]>([]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);

  // Reset entire workflow back to Stage 1 initial upload state
  const handleResetWorkflow = useCallback(() => {
    setStage('upload');
    setHighestCompletedStage(0);
    setFileSummary(null);
    setMappings({});
    setValidationRows([]);
    setMatchResults([]);
  }, []);

  // Handler: File Uploaded and Parsed
  const handleFileUpload = useCallback((summary: UploadedFileSummary) => {
    setFileSummary(summary);
    setMappings({});
    setValidationRows([]);
    setMatchResults([]);
  }, []);

  // Handler: Proceed to Column Mapping
  const handleProceedToMapping = useCallback(() => {
    setStage('map-fields');
  }, []);

  // Handler: Column Mappings Confirmed -> Execute Australian Address Normalization & Validation
  const handleConfirmMapping = useCallback((confirmedMappings: ColumnMapping) => {
    if (!fileSummary) return;

    setMappings(confirmedMappings);

    // Run address normalisation and exception checks across all rows
    const seenAddresses = new Map<string, number>();
    const validated = fileSummary.allRawRows.map((rawRow, idx) =>
      validateAndNormaliseRow(rawRow, idx, confirmedMappings, seenAddresses)
    );

    setValidationRows(validated);
    setHighestCompletedStage((prev) => Math.max(prev, 1));
    setStage('validate');
  }, [fileSummary]);

  // Handler: Update validation rows after inline or batch corrections
  const handleUpdateValidationRows = useCallback((updated: ValidationRow[]) => {
    setValidationRows(updated);
  }, []);

  // Handler: Begin Agentbox Matching Run
  const handleProceedToMatching = useCallback(() => {
    setHighestCompletedStage((prev) => Math.max(prev, 2));
    setStage('match');
  }, []);

  // Handler: Matching Run Finished -> Transition to Results
  const handleMatchComplete = useCallback((results: MatchResult[]) => {
    setMatchResults(results);
    setHighestCompletedStage(3);
    setStage('results');
  }, []);

  // Handler: Cancel Matching Run -> Return to Validation
  const handleCancelMatch = useCallback(() => {
    setStage('validate');
  }, []);

  // Handler: Stepper Direct Navigation to Completed Stages
  const handleNavigateStage = useCallback((targetStage: WorkflowStage) => {
    setStage(targetStage);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f8f6] text-[#1a1c20] selection:bg-[#0f3d52] selection:text-white">
      {/* Global Brand Header */}
      <Header
        canReset={fileSummary !== null}
        onResetWorkflow={handleResetWorkflow}
      />

      {/* 3-Stage Progress Stepper */}
      <Stepper
        currentStage={stage}
        onNavigateStage={handleNavigateStage}
        highestCompletedStage={highestCompletedStage}
      />

      {/* Main Workflow View Canvas */}
      <main className="flex-1 pb-16">
        {/* Stage 1: File Upload */}
        {stage === 'upload' && (
          <UploadView
            fileSummary={fileSummary}
            onFileUpload={handleFileUpload}
            onProceedToMapping={handleProceedToMapping}
            onResetFile={() => setFileSummary(null)}
          />
        )}

        {/* Stage 1 Sub-step: Column Mapping */}
        {stage === 'map-fields' && fileSummary && (
          <MapFieldsView
            fileSummary={fileSummary}
            initialMapping={mappings}
            onConfirmMapping={handleConfirmMapping}
            onBackToUpload={() => setStage('upload')}
          />
        )}

        {/* Stage 2: Validation Exception Queue */}
        {stage === 'validate' && (
          <ValidateView
            rows={validationRows}
            onUpdateRows={handleUpdateValidationRows}
            onProceedToMatching={handleProceedToMatching}
            onBackToMapping={() => setStage('map-fields')}
          />
        )}

        {/* Stage 2 Transient: Async Match Processing */}
        {stage === 'match' && (
          <MatchProcessingView
            validationRows={validationRows}
            onMatchComplete={handleMatchComplete}
            onCancelMatch={handleCancelMatch}
          />
        )}

        {/* Stage 3: Results Call List & CSV Exports */}
        {stage === 'results' && fileSummary && (
          <ResultsView
            fileSummary={fileSummary}
            results={matchResults}
            onStartAnotherMatch={handleResetWorkflow}
          />
        )}
      </main>
    </div>
  );
}
