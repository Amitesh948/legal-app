import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AdvocateDashboard } from '../../../core/models/dashboard.model';
import { AdvocateStatusService } from '../../../core/services/advocate-status.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-advocate-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, StatCardComponent, EmptyStateComponent,
    ErrorStateComponent, SkeletonLoaderComponent, AvatarComponent
  ],
  templateUrl: './advocate-dashboard.page.html',
  styleUrl: './advocate-dashboard.page.scss'
})
export class AdvocateDashboardPage implements OnInit {
  user: any | null = null;
  advocateStatus = '';
  dashboard: AdvocateDashboard | null = null;
  loading = true;
  error = false;
  errorMessage = '';
  currentDate = new Date();

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private statusService: AdvocateStatusService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.statusService.getStatus().subscribe(res => {
      this.advocateStatus = res?.user?.status || '';
      this.cdr.detectChanges();
    });
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = false;
    this.dashboardService.getAdvocateDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = err.message || 'Unable to load your dashboard.';
        this.cdr.detectChanges();
      }
    });
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  getStatusClass(status: string): string {
    const s = status?.toLowerCase();
    if (s === 'completed' || s === 'resolved') return 'badge-success';
    if (s === 'pending' || s === 'draft') return 'badge-warning';
    if (s === 'rejected' || s === 'closed') return 'badge-gray';
    return 'badge-info';
  }

  getDotClass(status: string): string {
    const s = status?.toLowerCase();
    if (s === 'completed' || s === 'resolved') return 'dot-success';
    if (s === 'pending' || s === 'draft') return 'dot-warning';
    if (s === 'rejected' || s === 'closed') return 'dot-gray';
    return 'dot-info';
  }
}
