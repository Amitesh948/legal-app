import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonRefresher, IonRefresherContent } from '@ionic/angular';
import { ApiService } from '../../../core/services/api.service';
import { LegalOpinionResponse } from '../../../core/models/ai-legal.model';
import { normalizeEnumValue, OpinionStatus, RiskLevel, RISK_LEVEL_LABELS } from '../../../shared/constants/ai-status.constants';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-advocate-opinions',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    SkeletonLoaderComponent,
    ErrorStateComponent,
    EmptyStateComponent
  ],
  templateUrl: './advocate-opinions.page.html',
  styleUrl: './advocate-opinions.page.scss'
})
export class AdvocateOpinionsPage implements OnInit {
  opinions: LegalOpinionResponse[] = [];
  loading = true;
  error = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadOpinions();
  }

  loadOpinions() {
    this.loading = true;
    this.error = false;

    this.api.get<LegalOpinionResponse[]>('/legal-opinions')
      .subscribe({
        next: (res) => {
          this.opinions = res;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = true;
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  handleRefresh(event: any) {
    this.api.get<LegalOpinionResponse[]>('/legal-opinions')
      .subscribe({
        next: (res) => {
          this.opinions = res;
          event.target.complete();
          this.cdr.detectChanges();
        },
        error: () => {
          event.target.complete();
          this.cdr.detectChanges();
        }
      });
  }

  getStatus(opinion: LegalOpinionResponse): string {
    return normalizeEnumValue(opinion.status);
  }

  getStatusLabel(opinion: LegalOpinionResponse): string {
    const s = this.getStatus(opinion);
    switch (s) {
      case OpinionStatus.DRAFT: return 'Draft';
      case OpinionStatus.GENERATING: return 'Generating...';
      case OpinionStatus.UNDER_REVIEW: return 'Under Review';
      case OpinionStatus.REVISED: return 'Revised';
      case OpinionStatus.APPROVED: return 'Approved';
      case OpinionStatus.PDF_GENERATED: return 'PDF Ready';
      default: return s || 'Unknown';
    }
  }

  getStatusClass(opinion: LegalOpinionResponse): string {
    const s = this.getStatus(opinion);
    switch (s) {
      case OpinionStatus.DRAFT:
      case OpinionStatus.REVISED:
        return 'badge-warning';
      case OpinionStatus.APPROVED:
      case OpinionStatus.PDF_GENERATED:
        return 'badge-success';
      case OpinionStatus.GENERATING:
        return 'badge-info';
      default:
        return 'badge-gray';
    }
  }

  getRiskLabel(opinion: LegalOpinionResponse): string {
    const rl = normalizeEnumValue(opinion.risk_level);
    return RISK_LEVEL_LABELS[rl] || 'Not assessed';
  }

  getRiskClass(opinion: LegalOpinionResponse): string {
    const rl = normalizeEnumValue(opinion.risk_level);
    switch (rl) {
      case RiskLevel.LOW: return 'badge-success';
      case RiskLevel.MEDIUM: return 'badge-warning';
      case RiskLevel.HIGH:
      case RiskLevel.CRITICAL: return 'badge-danger';
      default: return 'badge-gray';
    }
  }

  navigateToCase(caseId: string) {
    this.router.navigate(['/advocate/cases', caseId]);
  }
}
