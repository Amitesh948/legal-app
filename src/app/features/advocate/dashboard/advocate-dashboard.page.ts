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
import { CaseStatus, CASE_STATUS_LABELS } from '../../../shared/constants/case-status.constants';

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

  getStatusLabel(status: string): string {
    if (!status) return '';
    const normalized = status.includes('.') ? status.split('.').pop()! : status;
    return CASE_STATUS_LABELS[normalized] || normalized;
  }

  getStatusClass(status: string): string {
    if (!status) return 'badge-gray';
    const normalized = status.includes('.') ? status.split('.').pop()! : status;
    
    switch (normalized as CaseStatus) {
      case CaseStatus.NEW:
      case CaseStatus.AI_PROCESSING:
      case CaseStatus.DOCUMENTS_UPLOADED:
        return 'badge-info';
      case CaseStatus.IN_PROGRESS:
      case CaseStatus.ADVOCATE_ASSIGNED:
      case CaseStatus.LEGAL_REVIEW:
      case CaseStatus.UNDER_REVIEW:
      case CaseStatus.DOCUMENTS_UNDER_REVIEW:
      case CaseStatus.LEGAL_OPINION_DRAFT:
      case CaseStatus.LEGAL_OPINION_SUBMITTED:
        return 'badge-brand';
      case CaseStatus.PAYMENT_PENDING:
      case CaseStatus.PENDING_ASSIGNMENT:
      case CaseStatus.INFORMATION_REQUIRED:
        return 'badge-warning';
      case CaseStatus.COMPLETED:
      case CaseStatus.PAYMENT_COMPLETED:
      case CaseStatus.REPORT_GENERATED:
      case CaseStatus.OPINION_GENERATED:
        return 'badge-success';
      case CaseStatus.CANCELLED:
      case CaseStatus.CLOSED:
        return 'badge-danger';
      default:
        return 'badge-gray';
    }
  }

  getDotClass(status: string): string {
    return this.getStatusClass(status).replace('badge-', 'dot-');
  }
}
