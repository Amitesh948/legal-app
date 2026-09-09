import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { HttpEvent } from '@angular/common/http';

export interface CaseDocument {
  id: string;
  case_id: string;
  uploaded_by: string;
  category: string;
  original_filename: string;
  mime_type: string;
  extension: string;
  file_size: number;
  version: number;
  created_at: string;
  updated_at?: string;
  ai_status?: string;
}

export interface AiSummary {
  id: string;
  case_id: string;
  document_id: string;
  case_details?: {
    court?: string;
    case_number?: string;
    case_type?: string;
    plaintiff?: string;
    defendant?: string;
  };
  background?: string;
  plaintiff_claims?: string[];
  defendant_position?: string[];
  important_facts?: string[];
  timeline?: { date: string; event: string }[];
  legal_issues?: string[];
  reliefs_sought?: string[];
  supporting_documents?: string[];
  risk_assessment?: {
    level: string;
    reason: string;
  };
  overall_summary?: string;
  provider?: string;
  status?: string;
}

export interface ProcessingStatus {
  document_id: string;
  overall_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  ocr_status: string;
  ai_status: string;
  ocr_error?: string | null;
  ai_error?: string | null;
  ai_retries: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  constructor(private api: ApiService) {}

  getCaseDocuments(caseId: string): Observable<CaseDocument[]> {
    return this.api.get<CaseDocument[]>(`/documents/case/${caseId}`);
  }

  uploadDocument(caseId: string, file: File, category: string = 'OTHER', remarks?: string): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('case_id', caseId);
    formData.append('category', category);
    formData.append('file', file);
    if (remarks) {
      formData.append('remarks', remarks);
    }
    return this.api.upload('/documents/upload', formData);
  }

  downloadDocument(documentId: string): Observable<Blob> {
    return this.api.getBlob(`/documents/download/${documentId}`);
  }

  triggerAiProcessing(documentId: string): Observable<{ message: string; document_id: string }> {
    return this.api.post<{ message: string; document_id: string }>(`/document-processing/${documentId}/process`, {});
  }

  getProcessingStatus(documentId: string): Observable<ProcessingStatus> {
    return this.api.get<ProcessingStatus>(`/document-processing/${documentId}/processing-status`);
  }

  getAiSummary(documentId: string): Observable<AiSummary> {
    return this.api.get<AiSummary>(`/document-processing/${documentId}/summary`);
  }
}
