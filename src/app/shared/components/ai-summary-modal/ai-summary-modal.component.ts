import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, ModalController } from '@ionic/angular';
import { ApiService } from '../../../core/services/api.service';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '../error-state/error-state.component';

@Component({
  selector: 'app-ai-summary-modal',
  standalone: true,
  imports: [
    CommonModule, 
    IonContent, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonButtons, 
    IonButton, 
    IonIcon,
    SkeletonLoaderComponent,
    ErrorStateComponent
  ],
  templateUrl: './ai-summary-modal.component.html',
  styleUrl: './ai-summary-modal.component.scss'
})
export class AiSummaryModalComponent implements OnInit {
  @Input() documentId!: string;
  @Input() documentName!: string;

  loading = true;
  error = false;
  
  summary: any = null;
  extractedText: string | null = null;
  
  activeTab: 'summary' | 'raw' = 'summary';

  constructor(
    private modalCtrl: ModalController,
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = false;

    // We can run these in parallel or sequential. Let's do sequential or Promise.all.
    Promise.all([
      this.api.get<any>(`/document-processing/${this.documentId}/summary`).toPromise().catch(() => null),
      this.api.get<any>(`/document-processing/${this.documentId}/text`).toPromise().catch(() => null)
    ]).then(([summaryRes, textRes]) => {
      this.summary = summaryRes;
      this.extractedText = textRes?.extracted_text || 'No text extracted.';
      
      if (!this.summary && (!textRes || !textRes.extracted_text)) {
        this.error = true;
      }
      
      this.loading = false;
      this.cdr.detectChanges();
    }).catch(() => {
      this.error = true;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  setTab(tab: 'summary' | 'raw') {
    this.activeTab = tab;
  }

  copySummary() {
    const textToCopy = this.summary?.overall_summary || 'No summary available';
    navigator.clipboard.writeText(textToCopy).then(() => {
      // In a real app, show a toast. For now, alert is fine.
      alert('Summary copied to clipboard!');
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
