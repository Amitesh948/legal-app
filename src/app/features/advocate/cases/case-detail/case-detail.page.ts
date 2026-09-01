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
    ChatRoomComponent
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
  
  tabs = ['Overview', 'Documents', 'Messages', 'Opinions'];
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Client-side validation
    const maxMb = 10;
    if (file.size > maxMb * 1024 * 1024) {
      alert(`File is too large. Max size is ${maxMb}MB.`);
      this.resetFileInput();
      return;
    }
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      alert('Unsupported file type. Please upload a PDF, Image, or Word document.');
      this.resetFileInput();
      return;
    }

    this.startUpload(file);
    this.resetFileInput();
  }

  private resetFileInput() {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private startUpload(file: File) {
    const optimisticId = 'temp-' + Date.now();
    const optimisticDoc = {
      id: optimisticId,
      original_filename: file.name,
      file_size: file.size,
      extension: file.name.split('.').pop() || '',
      created_at: new Date().toISOString(),
      isUploading: true,
      progress: 0,
      error: false,
      rawFile: file // Keep for retry
    };
    
    this.documents.unshift(optimisticDoc);
    this.performUpload(optimisticDoc);
  }

  private performUpload(doc: any) {
    doc.isUploading = true;
    doc.error = false;
    doc.progress = 0;
    
    const formData = new FormData();
    formData.append('file', doc.rawFile);
    formData.append('case_id', this.caseId!);
    formData.append('category', 'OTHER');

    this.api.upload('/documents/upload', formData).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          doc.progress = Math.round(100 * event.loaded / (event.total || event.loaded));
          this.cdr.detectChanges();
        } else if (event.type === HttpEventType.Response) {
          // Success
          Object.assign(doc, event.body);
          doc.isUploading = false;
          doc.error = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        doc.isUploading = false;
        doc.error = true;
        this.cdr.detectChanges();
      }
    });
  }

  onDocumentTap(doc: any) {
    if (doc.error) {
      this.performUpload(doc);
    } else if (!doc.isUploading) {
      // Download or preview
      console.log('Document tapped for preview/download:', doc);
      // In a real app we would open the file or use Browser plugin
    }
  }

  get statusClass(): string {
    const s = this.caseData?.case?.status?.toLowerCase() || '';
    if (s === 'open' || s === 'active' || s.includes('new')) return 'badge-info';
    if (s === 'pending' || s.includes('review')) return 'badge-warning';
    if (s === 'closed' || s === 'completed') return 'badge-success';
    if (s === 'urgent' || s === 'overdue') return 'badge-danger';
    return 'badge-gray';
  }

  goBack() {
    this.router.navigate(['/advocate/cases']);
  }
}
