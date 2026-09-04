import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface AIMessageSource {
  document_id: string;
  document_name: string;
  page?: number;
}

export interface AIMessage {
  id?: string;
  role: 'USER' | 'AI' | 'SYSTEM';
  message: string;
  sources?: AIMessageSource[];
  created_at?: string;
}

export interface AIConversation {
  id: string;
  case_id: string;
  user_id: string;
  conversation_type: 'GENERAL' | 'DOCUMENT';
  title?: string;
  created_at: string;
  updated_at?: string;
  messages: AIMessage[];
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
}

export interface DocumentChatRequest extends ChatRequest {
  document_ids: string[];
}

export interface ChatResponse {
  conversation_id: string;
  message_id: string;
  answer: string;
  sources: AIMessageSource[];
}

@Injectable({
  providedIn: 'root'
})
export class AiChatService {

  constructor(private api: ApiService) {}

  /**
   * Fetch all conversation history for a given case.
   * Note: The backend currently returns the entire history without pagination.
   */
  getConversations(caseId: string): Observable<AIConversation[]> {
    return this.api.get<AIConversation[]>(`/cases/${caseId}/ai/conversations`).pipe(
      catchError(this.handleChatError)
    );
  }

  /**
   * Send a general case-related message to the AI.
   * This is a synchronous HTTP request (wait for full response), not a stream.
   */
  sendCaseMessage(caseId: string, payload: ChatRequest): Observable<ChatResponse> {
    return this.api.post<ChatResponse>(`/cases/${caseId}/ai/chat`, payload).pipe(
      catchError(this.handleChatError)
    );
  }

  /**
   * Send a document-scoped message to the AI, specifying document IDs.
   * This is a synchronous HTTP request (wait for full response), not a stream.
   */
  sendDocumentMessage(caseId: string, payload: DocumentChatRequest): Observable<ChatResponse> {
    return this.api.post<ChatResponse>(`/cases/${caseId}/documents/ai/chat`, payload).pipe(
      catchError(this.handleChatError)
    );
  }

  /**
   * Centralized error handler for AI Chat to catch and surface the specific 403 restrictions.
   */
  private handleChatError(error: any): Observable<never> {
    let errorMessage = 'Failed to communicate with AI.';
    
    if (error.status === 403) {
      if (error.message?.includes('access this case')) {
        errorMessage = 'You are not assigned to this case and cannot access its AI assistant.';
      } else {
        errorMessage = 'You do not have permission to use the AI chat feature.';
      }
    } else if (error.status === 400) {
      errorMessage = error.message || 'Invalid request parameters.';
    } else if (error.status === 404) {
      errorMessage = 'Case or conversation not found.';
    } else if (error.status >= 500) {
      errorMessage = 'The AI service is currently unavailable. Please try again later.';
    }

    return throwError(() => new Error(errorMessage));
  }
}
