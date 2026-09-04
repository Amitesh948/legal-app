import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const val = params[key];
        if (val !== undefined && val !== null) {
          httpParams = httpParams.set(key, String(val));
        }
      });
    }
    return this.http
      .get<T>(`${this.baseUrl}${endpoint}`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  patch<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .patch<T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  postFormData<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}${endpoint}`, formData)
      .pipe(catchError(this.handleError));
  }

  upload(endpoint: string, formData: FormData) {
    return this.http.post(`${this.baseUrl}${endpoint}`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(catchError(this.handleError));
  }

  getBlob(endpoint: string): Observable<Blob> {
    return this.http
      .get(`${this.baseUrl}${endpoint}`, { responseType: 'blob' })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred';
    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else if (error.error?.detail) {
      message = typeof error.error.detail === 'string'
        ? error.error.detail
        : 'Request failed';
    } else if (error.status === 0) {
      message = 'Unable to connect to the server. Please check your connection.';
    } else if (error.status === 401) {
      message = 'Session expired. Please log in again.';
    } else if (error.status === 403) {
      message = 'You do not have permission to perform this action.';
    }
    return throwError(() => ({ status: error.status, message }));
  }
}
