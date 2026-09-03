import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, ReplaySubject, of, catchError } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';

export interface AdvocateStatusResponse {
  user: {
    id: string;
    email: string;
    status: string;
    role: string;
  };
  profile: any;
  documents: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AdvocateStatusService {
  private statusCache$: Observable<AdvocateStatusResponse> | null = null;

  constructor(private api: ApiService) {}

  getStatus(forceRefresh = false): Observable<AdvocateStatusResponse> {
    if (!this.statusCache$ || forceRefresh) {
      this.statusCache$ = this.api.get<AdvocateStatusResponse>('/advocates/me').pipe(
        shareReplay(1),
        catchError(err => {
          this.statusCache$ = null; // Clear cache on error
          throw err;
        })
      );
    }
    return this.statusCache$;
  }

  clearCache() {
    this.statusCache$ = null;
  }
}
