/**
 * TypeScript interfaces for AI Legal Engine API responses.
 * Maps directly to the backend Pydantic schemas in app/schemas/ai_legal.py.
 */

// ----- Case Analysis -----

export interface CaseAnalysisResponse {
  id: string;
  case_id: string;
  status: string; // CaseAnalysisStatus enum value (or with prefix)
  executive_summary: string | null;
  material_facts: string[] | null;
  chronology: ChronologyEntry[] | null;
  legal_issues: string[] | null;
  applicable_laws: string[] | null;
  evidence_assessment: string[] | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  risks: string[] | null;
  missing_information: string[] | null;
  recommendations: string[] | null;
  suggested_precedents: PrecedentEntry[] | null;
  ai_model: string | null;
  prompt_version: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ChronologyEntry {
  date?: string;
  event?: string;
  [key: string]: string | undefined;
}

export interface PrecedentEntry {
  case_name?: string;
  citation?: string;
  relevance?: string;
  [key: string]: string | undefined;
}

// ----- Legal Opinion -----

export interface LegalOpinionResponse {
  id: string;
  case_id: string;
  version: number;
  status: string; // OpinionStatus enum value (or with prefix)
  // AI Generated Content
  documents_reviewed: string[] | null;
  instructions: string | null;
  brief_facts: string | null;
  issues: string[] | null;
  applicable_law: string[] | null;
  legal_analysis: string | null;
  evidence_assessment: string | null;
  precedents: string[] | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  risks: string[] | null;
  risk_level: string | null;
  conclusion: string | null;
  recommendations: string[] | null;
  disclaimer: string | null;
  // Advocate fields
  advocate_opinion: string | null;
  advocate_recommendations: string[] | string | null;
  winning_probability: number | null; // 0-100
  advocate_risk_assessment: string | null;
  advocate_notes: string | null;
  // Timestamps
  created_at: string;
  updated_at: string | null;
  approved_at: string | null;
}
