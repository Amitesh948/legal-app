import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AdvocateStatusService } from './advocate-status.service';
import {
  ClientProfile,
  ClientProfileUpdate,
  AdvocateFullProfile
} from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {

  constructor(private api: ApiService, private injector: Injector) {}

  /* ── Client ── */
  getClientProfile(): Observable<ClientProfile> {
    return this.api.get<ClientProfile>('/clients/me');
  }

  updateClientProfile(data: ClientProfileUpdate): Observable<ClientProfile> {
    return this.api.put<ClientProfile>('/clients/me', data);
  }

  /* ── Advocate ── */
  getAdvocateProfile(): Observable<AdvocateFullProfile> {
    return this.api.get<AdvocateFullProfile>('/advocates/me');
  }

  updateAdvocateProfile(data: any): Observable<AdvocateFullProfile> {
    return this.api.put<AdvocateFullProfile>('/advocates/me', data).pipe(
      tap(() => {
        try {
          const statusService = this.injector.get(AdvocateStatusService);
          statusService.clearCache();
        } catch(e) {}
      })
    );
  }
}
