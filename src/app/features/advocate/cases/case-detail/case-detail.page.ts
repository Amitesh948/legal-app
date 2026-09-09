import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonRefresher, IonRefresherContent, ModalController } from '@ionic/angular';
import { ApiService } from '../../../../core/services/api.service';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { TimelineComponent } from '../../../../shared/components/timeline/timeline.component';
import { DocumentListItemComponent } from '../../../../shared/components/document-list-item/document-list-item.component';
import { AiSummaryModalComponent } from '../../../../shared/components/ai-summary-modal/ai-summary-modal.component';
import { ChatRoomComponent } from '../../../../shared/components/chat-room/chat-room.component';
import { AiCaseAnalysisComponent } from '../../../../shared/components/ai-case-analysis/ai-case-analysis.component';
import { DocumentUploadComponent } from '../../../../shared/components/document-upload/document-upload.component';
import { AiOpinionViewerComponent } from '../../../../shared/components/ai-opinion-viewer/ai-opinion-viewer.component';
import { CaseReportsComponent } from '../../../../shared/components/case-reports/case-reports.component';
import { CaseStatus, CASE_STATUS_LABELS } from '../../../../shared/constants/case-status.constants';

@Component({
  selector: 'app-advocate-case-detail',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    SkeletonLoaderComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    TimelineComponent,
    DocumentListItemComponent,
    ChatRoomComponent,
    AiCaseAnalysisComponent,
    AiOpinionViewerComponent,
    CaseReportsComponent,
    DocumentUploadComponent
  ],
  templateUrl: './case-detail.page.html',
  styleUrl: './case-detail.page.scss'
})
export class AdvocateCaseDetailPage implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  caseId: string | null = null;
  caseData: any = null;
  timelineEvents: any[] = [];
  
  loading = true;
  error = false;
  
  tabs = ['Overview', 'Documents', 'Messages', 'Opinions', 'Reports'];
  activeTab = 'Overview';
  
  documents: any[] = [];
  documentsLoading = false;
  documentsError = false;
  documentsFetched = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.caseId = this.route.snapshot.paramMap.get('id');
    if (this.caseId) {
      this.loadCaseDetails();
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  loadCaseDetails(event?: any) {
    this.loading = true;
    this.error = false;

    this.api.get<any>(`/cases/${this.caseId}`).subscribe({
      next: (res) => {
        this.caseData = res.data || res;
        this.loadTimeline(event);
      },
      error: () => {
        this.error = true;
        this.loading = false;
        if (event) event.target.complete();
        this.cdr.detectChanges();
      }
    });
  }

  loadTimeline(event?: any) {
    this.api.get<any>(`/cases/${this.caseId}/history`).subscribe({
      next: (res) => {
        const history = Array.isArray(res) ? res : (res.data || []);
        this.timelineEvents = history.map((item: any) => ({
          id: item.id,
          title: this.formatActionType(item.action_type),
          description: this.formatActionDescription(item),
          timestamp: item.created_at,
          type: this.mapActionType(item.action_type)
        }));
        this.loading = false;
        if (event) event.target.complete();
        this.cdr.detectChanges();
      },
      error: () => {
        this.timelineEvents = [];
        this.loading = false;
        if (event) event.target.complete();
        this.cdr.detectChanges();
      }
    });
  }

  private formatActionType(action: string): string {
    if (!action) return 'Update';
    return action.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  }

  private formatActionDescription(item: any): string {
    if (item.action_type === 'CASE_CREATED') return 'Case was successfully opened.';
    if (item.action_type === 'STATUS_CHANGED') return `Status changed from ${this.cleanStatus(item.previous_value)} to ${this.cleanStatus(item.new_value)}.`;
    return 'Case details updated.';
  }

  private cleanStatus(val: string): string {
    if (!val) return 'Unknown';
    return val.replace('CaseStatus.', '');
  }

  private mapActionType(action: string): string {
    if (action === 'CASE_CREATED' || action === 'STATUS_CHANGED') return 'status_change';
    return 'general';
  }

  doRefresh(event: any) {
    if (this.activeTab === 'Documents') {
      this.loadDocuments(event);
    } else {
      this.loadCaseDetails(event);
    }
  }

  setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'Documents' && !this.documentsFetched) {
      this.loadDocuments();
    }
  }

  openAiChat() {
    if (this.caseId) {
      this.router.navigate(['/advocate/cases', this.caseId, 'ai-chat']);
    }
  }

  loadDocuments(event?: any) {
    this.documentsLoading = true;
    this.documentsError = false;
    
    this.api.get<any>(`/documents/case/${this.caseId}`).subscribe({
      next: (res) => {
        this.documents = Array.isArray(res) ? res : (res.data || res.items || []);
        this.documentsLoading = false;
        this.documentsFetched = true;
        if (event) event.target.complete();
        this.cdr.detectChanges();
      },
      error: () => {
        this.documentsError = true;
        this.documentsLoading = false;
        if (event) event.target.complete();
        this.cdr.detectChanges();
      }
    });
  }

  triggerUpload() {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  async openAiSummaryModal(event: { documentId: string, title: string }) {
    const modal = await this.modalCtrl.create({
      component: AiSummaryModalComponent,
      componentProps: {
        documentId: event.documentId,
        documentName: event.title
      },
      breakpoints: [0, 0.5, 0.85, 1],
      initialBreakpoint: 0.85,
      handle: false
    });
    await modal.present();
  }

  onUploadComplete(doc: any) {
    if (!this.documents) {
      this.documents = [];
    }
    this.documents.unshift(doc);
    // Refresh list to ensure we have all fields from server
    this.loadDocuments();
  }

  onDocumentTap(doc: any) {
    if (!doc.isUploading) {
      console.log('Downloading document:', doc);
      this.api.getBlob(`/documents/download/${doc.id}`).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = doc.original_filename || 'document';
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          alert('Failed to download document. ' + err.message);
        }
      });
    }
  }

  get statusLabel(): string {
    if (!this.caseData?.case?.status) return '';
    const status = this.caseData.case.status;
    const normalized = status.includes('.') ? status.split('.').pop()! : status;
    return CASE_STATUS_LABELS[normalized] || normalized;
  }

  get statusClass(): string {
    const status = this.caseData?.case?.status;
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

  goBack() {
    this.router.navigate(['/advocate/cases']);
  }
}
