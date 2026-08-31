import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, timer, of, forkJoin } from 'rxjs';
import { switchMap, takeWhile, catchError, takeUntil } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProcessingStatus } from '../../constants/document-processing.constants';

@Component({
  selector: 'app-document-list-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-list-item.component.html',
  styleUrl: './document-list-item.component.scss'
})
export class DocumentListItemComponent implements OnInit, OnDestroy {
  @Input() document!: any;
  @Output() actionClick = new EventEmitter<any>();
  @Output() showSummary = new EventEmitter<{ documentId: string, title: string }>();

  isAdvocate = false;
  
  aiStatus: ProcessingStatus | null = null;
  aiPolling = false;
  aiError = false;
  hasSummary = false;

  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.isAdvocate = this.auth.getUserRole() === 'ADVOCATE';
    if (this.isAdvocate && this.document?.id && !this.document.isUploading && !this.document.error) {
      this.checkAiStatus();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkAiStatus() {
    // Check both processing-status AND summary availability in parallel.
    // The processing-status endpoint may show FAILED for OCR/AI jobs
    // while a summary already exists from a previous successful run.
    forkJoin({
      status: this.api.get<any>(`/document-processing/${this.document.id}/processing-status`).pipe(
        catchError(() => of(null))
      ),
      summary: this.api.get<any>(`/document-processing/${this.document.id}/summary`).pipe(
        catchError(() => of(null))
      )
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe(({ status, summary }) => {
      // If a summary already exists, mark as available regardless of job status
      if (summary && summary.overall_summary) {
        this.hasSummary = true;
        this.aiStatus = ProcessingStatus.COMPLETED;
        return;
      }

      // Otherwise, rely on the processing-status endpoint
      if (status && status.overall_status) {
        this.aiStatus = status.overall_status as ProcessingStatus;
        if (this.aiStatus === ProcessingStatus.PENDING || this.aiStatus === ProcessingStatus.PROCESSING) {
          this.startPolling();
        }
      }
    });
  }

  runAiSummary(event: Event) {
    event.stopPropagation();
    if (this.aiPolling || this.aiStatus === ProcessingStatus.PROCESSING || this.aiStatus === ProcessingStatus.PENDING) return;
    
    this.aiPolling = true;
    this.aiError = false;
    
    // Check if we need to retry or start fresh
    const endpoint = (this.aiStatus === ProcessingStatus.FAILED && !this.hasSummary) 
      ? `/document-processing/${this.document.id}/retry`
      : `/document-processing/${this.document.id}/process`;

    this.api.post<any>(endpoint, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.aiStatus = ProcessingStatus.PENDING;
          this.startPolling();
        },
        error: () => {
          this.aiPolling = false;
          this.aiError = true;
          this.aiStatus = ProcessingStatus.FAILED;
        }
      });
  }

  private startPolling() {
    this.aiPolling = true;
    this.aiError = false;
    
    timer(3000, 5000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.api.get<any>(`/document-processing/${this.document.id}/processing-status`).pipe(
          catchError(() => of({ overall_status: ProcessingStatus.FAILED }))
        )),
        takeWhile((res: any) => {
          const status = res.overall_status as ProcessingStatus;
          return status !== ProcessingStatus.COMPLETED && status !== ProcessingStatus.FAILED;
        }, true) // true to emit the final value before completing
      )
      .subscribe({
        next: (res: any) => {
          this.aiStatus = res.overall_status as ProcessingStatus;
        },
        complete: () => {
          this.aiPolling = false;
          if (this.aiStatus === ProcessingStatus.COMPLETED) {
            this.hasSummary = true;
            this.viewSummary(new Event(''));
          } else if (this.aiStatus === ProcessingStatus.FAILED) {
            this.aiError = true;
          }
        }
      });
  }

  viewSummary(event: Event) {
    if (event) event.stopPropagation();
    this.showSummary.emit({
      documentId: this.document.id,
      title: this.document.original_filename
    });
  }

  get fileIcon(): string {
    const ext = this.document.extension?.toLowerCase() || '';
    if (ext === 'pdf' || ext === '.pdf') return 'pdf';
    if (['.jpg', '.jpeg', '.png', '.gif', 'jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
    if (['.doc', '.docx', 'doc', 'docx'].includes(ext)) return 'word';
    return 'file';
  }

  get formattedSize(): string {
    const bytes = this.document.file_size || 0;
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  onTap() {
    this.actionClick.emit(this.document);
  }
}
