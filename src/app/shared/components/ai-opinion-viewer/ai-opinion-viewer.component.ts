import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, timer, of } from 'rxjs';
import { switchMap, takeUntil, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { LegalOpinionResponse } from '../../../core/models/ai-legal.model';
import { OpinionStatus, RiskLevel, RISK_LEVEL_LABELS, normalizeEnumValue } from '../../constants/ai-status.constants';

/** Statuses that clients are allowed to see. Anything else is advocate-internal. */
const CLIENT_VISIBLE_STATUSES = new Set([
  OpinionStatus.APPROVED,
  OpinionStatus.PDF_GENERATED
]);
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '../error-state/error-state.component';

@Component({
  selector: 'app-ai-opinion-viewer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SkeletonLoaderComponent,
    ErrorStateComponent
  ],
  templateUrl: './ai-opinion-viewer.component.html',
  styleUrl: './ai-opinion-viewer.component.scss'
})
export class AiOpinionViewerComponent implements OnInit, OnDestroy {
  @Input() caseId!: string;

  opinion: LegalOpinionResponse | null = null;
  loading = true;
  error = false;
  errorMessage = '';
  isGenerating = false;
  isTriggering = false;
  isSaving = false;
  saveError = '';
  saveSuccess = false;

  // Advocate editable fields
  editAdvocateOpinion = '';
  editAdvocateNotes = '';
  showOverwriteWarning = false;

  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  /** True if the current user is an advocate. */
  get isAdvocate(): boolean {
    return this.authService.getUserRole() === 'advocate';
  }

  /** True if the current user is a client. */
  get isClient(): boolean {
    return this.authService.getUserRole() === 'client';
  }

  ngOnInit() {
    this.loadOpinion();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get normalizedStatus(): string {
    return normalizeEnumValue(this.opinion?.status);
  }

  get isDraft(): boolean {
    const s = this.normalizedStatus;
    return s === OpinionStatus.DRAFT || s === OpinionStatus.REVISED;
  }

  get isApproved(): boolean {
    return this.normalizedStatus === OpinionStatus.APPROVED ||
           this.normalizedStatus === OpinionStatus.PDF_GENERATED;
  }

  get isFailed(): boolean {
    // The opinion task sets status to REJECTED on failure if no analysis exists
    const s = this.normalizedStatus;
    return s === 'REJECTED' || s === 'FAILED';
  }

  get normalizedRiskLevel(): string {
    return normalizeEnumValue(this.opinion?.risk_level);
  }

  get riskLevelLabel(): string {
    const rl = this.normalizedRiskLevel;
    return RISK_LEVEL_LABELS[rl] || rl || 'Not assessed';
  }

  get riskLevelClass(): string {
    switch (this.normalizedRiskLevel) {
      case RiskLevel.LOW: return 'badge-success';
      case RiskLevel.MEDIUM: return 'badge-warning';
      case RiskLevel.HIGH: return 'badge-danger';
      case RiskLevel.CRITICAL: return 'badge-danger';
      default: return 'badge-gray';
    }
  }

  get winningProbability(): number {
    return this.opinion?.winning_probability ?? 0;
  }

  get probabilityClass(): string {
    const wp = this.winningProbability;
    if (wp >= 70) return 'prob--success';
    if (wp >= 40) return 'prob--warning';
    return 'prob--danger';
  }

  loadOpinion() {
    this.loading = true;
    this.error = false;

    this.api.get<LegalOpinionResponse>(`/cases/${this.caseId}/legal-opinion`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const status = normalizeEnumValue(res.status);

          // PRIVACY GATE: Clients must not see opinions that haven't been
          // explicitly approved by the advocate. The backend endpoint has
          // no status filter, so we enforce it here.
          if (this.isClient && !CLIENT_VISIBLE_STATUSES.has(status as OpinionStatus)) {
            // Treat as "not found" for the client
            this.opinion = null;
            this.loading = false;
            this.cdr.detectChanges();
            return;
          }

          this.opinion = res;
          this.loading = false;

          if (status === OpinionStatus.GENERATING) {
            this.isGenerating = true;
            this.startPolling();
          } else {
            this.isGenerating = false;
            this.initEditFields();
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          if (err.status === 404) {
            this.opinion = null;
            this.loading = false;
          } else {
            this.error = true;
            this.errorMessage = err.message || 'Failed to load opinion.';
            this.loading = false;
          }
          this.cdr.detectChanges();
        }
      });
  }

  triggerGeneration() {
    // Check if there are existing advocate edits that would be lost
    if (this.opinion && (this.opinion.advocate_opinion || this.opinion.advocate_notes)) {
      this.showOverwriteWarning = true;
      return;
    }
    this.doGenerate();
  }

  confirmOverwrite() {
    this.showOverwriteWarning = false;
    this.doGenerate();
  }

  cancelOverwrite() {
    this.showOverwriteWarning = false;
  }

  private doGenerate() {
    this.isTriggering = true;
    this.error = false;

    this.api.post<LegalOpinionResponse>(`/cases/${this.caseId}/legal-opinion`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.opinion = res;
          this.isTriggering = false;
          this.isGenerating = true;
          this.startPolling();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isTriggering = false;
          this.error = true;
          this.errorMessage = err.message || 'Failed to trigger opinion generation.';
          this.cdr.detectChanges();
        }
      });
  }

  private startPolling() {
    timer(3000, 4000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => {
          if (document.hidden) return of(null);
          return this.api.get<LegalOpinionResponse>(`/cases/${this.caseId}/legal-opinion`).pipe(
            catchError(() => of(null))
          );
        })
      )
      .subscribe((res) => {
        if (!res) return;
        this.opinion = res;
        const status = normalizeEnumValue(res.status);

        if (status !== OpinionStatus.GENERATING) {
          this.isGenerating = false;
          this.initEditFields();
          this.destroy$.next();
          this.destroy$ = new Subject<void>();
        }
        this.cdr.detectChanges();
      });
  }

  private initEditFields() {
    if (this.opinion) {
      this.editAdvocateOpinion = this.opinion.advocate_opinion || '';
      this.editAdvocateNotes = this.opinion.advocate_notes || '';
    }
  }

  saveAdvocateFields() {
    if (!this.opinion) return;
    this.isSaving = true;
    this.saveError = '';
    this.saveSuccess = false;

    const payload = {
      advocate_opinion: this.editAdvocateOpinion,
      advocate_notes: this.editAdvocateNotes
    };

    this.api.put<LegalOpinionResponse>(`/legal-opinions/${this.opinion.id}`, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.opinion = res;
          this.isSaving = false;
          this.saveSuccess = true;
          setTimeout(() => {
            this.saveSuccess = false;
            this.cdr.detectChanges();
          }, 3000);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSaving = false;
          this.saveError = err.message || 'Failed to save.';
          this.cdr.detectChanges();
        }
      });
  }
}
