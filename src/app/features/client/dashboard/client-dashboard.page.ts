import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { User } from '../../../core/models/user.model';
import { ClientDashboard } from '../../../core/models/dashboard.model';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, StatCardComponent, EmptyStateComponent,
    ErrorStateComponent, SkeletonLoaderComponent, AvatarComponent
  ],
  templateUrl: './client-dashboard.page.html',
  styleUrl: './client-dashboard.page.scss'
})
export class ClientDashboardPage implements OnInit {
  user: User | null = null;
  dashboard: ClientDashboard | null = null;
  loading = true;
  error = false;
  errorMessage = '';
  currentDate = new Date();

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = false;
    this.dashboardService.getClientDashboard().subscribe({
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

  get activeCases(): number {
    if (!this.dashboard) return 0;
    return this.dashboard.total_cases - this.dashboard.completed_cases;
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
