import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, timer, of } from 'rxjs';
import { switchMap, takeUntil, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { CaseAnalysisResponse } from '../../../core/models/ai-legal.model';
import { CaseAnalysisStatus, normalizeEnumValue } from '../../constants/ai-status.constants';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '../error-state/error-state.component';

@Component({
  selector: 'app-ai-case-analysis',
  standalone: true,
  imports: [
    CommonModule,
    SkeletonLoaderComponent,
    ErrorStateComponent
  ],
  templateUrl: './ai-case-analysis.component.html',
  styleUrl: './ai-case-analysis.component.scss'
})
export class AiCaseAnalysisComponent implements OnInit, OnDestroy {
  @Input() caseId!: string;
  @Input() hasDocuments = false;

  analysis: CaseAnalysisResponse | null = null;
  loading = true;
  error = false;
  errorMessage = '';
  isGenerating = false;
  isTriggering = false;

  private destroy$ = new Subject<void>();

  // Expose the enum values for template comparisons
  readonly AnalysisStatus = CaseAnalysisStatus;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAnalysis();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get normalizedStatus(): string {
    return normalizeEnumValue(this.analysis?.status);
  }

  get isReady(): boolean {
    return this.normalizedStatus === CaseAnalysisStatus.READY;
  }

  get isFailed(): boolean {
    return this.normalizedStatus === CaseAnalysisStatus.FAILED;
  }

  get failedMessage(): string {
    if (!this.analysis) return '';
    // The backend sets executive_summary to a descriptive failure message
    if (this.isFailed && this.analysis.executive_summary?.startsWith('Failed:')) {
      return this.analysis.executive_summary;
    }
    return 'Analysis generation failed. Please try again.';
  }

  loadAnalysis() {
    this.loading = true;
    this.error = false;

    this.api.get<CaseAnalysisResponse>(`/cases/${this.caseId}/analysis`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.analysis = res;
          this.loading = false;
          const status = normalizeEnumValue(res.status);

          if (status === CaseAnalysisStatus.GENERATING) {
            this.isGenerating = true;
            this.startPolling();
          } else {
            this.isGenerating = false;
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          // 404 means analysis hasn't been run yet — not a real error
          if (err.status === 404) {
            this.analysis = null;
            this.loading = false;
          } else {
            this.error = true;
            this.errorMessage = err.message || 'Failed to load analysis.';
            this.loading = false;
          }
          this.cdr.detectChanges();
        }
      });
  }

  triggerAnalysis() {
    this.isTriggering = true;
    this.error = false;

    this.api.post<CaseAnalysisResponse>(`/cases/${this.caseId}/analysis`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.analysis = res;
          this.isTriggering = false;
          this.isGenerating = true;
          this.startPolling();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isTriggering = false;
          this.error = true;
          this.errorMessage = err.message || 'Failed to trigger analysis.';
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
          return this.api.get<CaseAnalysisResponse>(`/cases/${this.caseId}/analysis`).pipe(
            catchError(() => of(null))
          );
        })
      )
      .subscribe((res) => {
        if (!res) return;
        this.analysis = res;
        const status = normalizeEnumValue(res.status);

        if (status !== CaseAnalysisStatus.GENERATING) {
          this.isGenerating = false;
          // Stop polling by unsubscribing (destroy$ will handle cleanup)
          this.destroy$.next();
          // Reinit destroy$ for future use
          this.destroy$ = new Subject<void>();
        }
        this.cdr.detectChanges();
      });
  }

  /** Format chronology entries for display */
  getChronologyDate(entry: any): string {
    return entry?.date || entry?.Date || '';
  }

  getChronologyEvent(entry: any): string {
    return entry?.event || entry?.Event || entry?.description || '';
  }
}
