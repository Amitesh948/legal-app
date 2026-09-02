/**
 * Shared enums for AI processing statuses used across Case Analysis
 * and Legal Opinion features.
 */

// Case Analysis job status
export enum CaseAnalysisStatus {
  NOT_GENERATED = 'NOT_GENERATED',
  GENERATING = 'GENERATING',
  READY = 'READY',
  FAILED = 'FAILED'
}

// Legal Opinion workflow status
export enum OpinionStatus {
  NOT_GENERATED = 'NOT_GENERATED',
  GENERATING = 'GENERATING',
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  REVISED = 'REVISED',
  APPROVED = 'APPROVED',
  PDF_GENERATED = 'PDF_GENERATED'
}

// Risk level (used in Legal Opinion)
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export const RISK_LEVEL_LABELS: Record<string, string> = {
  [RiskLevel.LOW]: 'Low Risk',
  [RiskLevel.MEDIUM]: 'Medium Risk',
  [RiskLevel.HIGH]: 'High Risk',
  [RiskLevel.CRITICAL]: 'Critical Risk'
};

/**
 * Normalize an enum value that might come with a Python class prefix.
 * e.g. "CaseAnalysisStatus.GENERATING" → "GENERATING"
 * Resilient to both dirty and clean forms.
 */
export function normalizeEnumValue(raw: string | null | undefined): string {
  if (!raw) return '';
  const s = String(raw);
  return s.includes('.') ? s.split('.').pop()! : s;
}
