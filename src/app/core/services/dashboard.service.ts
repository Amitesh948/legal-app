import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ClientDashboard, AdvocateDashboard } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  constructor(private api: ApiService) {}

  getClientDashboard(): Observable<ClientDashboard> {
    return this.api.get<ClientDashboard>('/dashboard/client');
  }

  getAdvocateDashboard(): Observable<AdvocateDashboard> {
    return this.api.get<AdvocateDashboard>('/dashboard/advocate');
  }
}
