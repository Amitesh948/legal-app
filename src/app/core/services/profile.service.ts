import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  ClientProfile,
  ClientProfileUpdate,
  AdvocateFullProfile
} from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {

  constructor(private api: ApiService) {}

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
    return this.api.put<AdvocateFullProfile>('/advocates/me', data);
  }
}
