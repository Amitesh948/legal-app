import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '../error-state/error-state.component';
import { environment } from '../../../../environments/environment';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';

@Component({
  selector: 'app-case-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonLoaderComponent, ErrorStateComponent],
  templateUrl: './case-reports.component.html',
  styleUrls: ['./case-reports.component.scss']
})
export class CaseReportsComponent implements OnInit {
  @Input() caseId!: string;

  templates: any[] = [];
  reports: any[] = [];
  
  loading = true;
  error = false;
  
  selectedTemplateId: string = '';
  isGenerating = false;
  generateError = '';

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = false;
    
    // Load templates
    this.api.get<any[]>('/reports/templates').subscribe({
      next: (res) => {
        this.templates = res || [];
        if (this.templates.length > 0) {
          this.selectedTemplateId = this.templates[0].id;
        }
        this.loadReports();
      },
      error: () => {
        this.error = true;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadReports() {
    this.api.get<any[]>(`/reports/case/${this.caseId}`).subscribe({
      next: (res) => {
        this.reports = res || [];
        // Sort newest first
        this.reports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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

  getTemplateName(templateId: string): string {
    const t = this.templates.find(x => x.id === templateId);
    return t ? t.name : 'Unknown Template';
  }

  generateReport() {
    if (!this.selectedTemplateId) return;
    
    this.isGenerating = true;
    this.generateError = '';
    
    this.api.post<any>(`/reports/generate/${this.caseId}?template_id=${this.selectedTemplateId}`, {}).subscribe({
      next: (res) => {
        this.isGenerating = false;
        // Prepend new report
        this.reports.unshift(res);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isGenerating = false;
        this.generateError = err?.message || 'Failed to generate report. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  async downloadReport(report: any) {
    if (!report.file_path) return;
    
    const url = `${environment.apiUrl}/reports/download/${report.id}`;
    const filename = `report_${report.id}.pdf`;

    try {
      // 1. Fetch the file as a blob
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to download report from server.');
      const blob = await response.blob();

      // 2. Convert Blob to Base64
      const base64Data = await this.convertBlobToBase64(blob) as string;

      // 3. Request permissions (required on Android 10+)
      try {
        const permStatus = await Filesystem.checkPermissions();
        if (permStatus.publicStorage !== 'granted') {
          const requested = await Filesystem.requestPermissions();
          if (requested.publicStorage !== 'granted') {
            alert('Storage permission is required to save reports.');
            return;
          }
        }
      } catch (permErr) {
        // Some platforms/versions might not support checkPermissions, proceed anyway
        console.warn('Permission check skipped', permErr);
      }

      // 4. Write to device storage
      const writeResult = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Documents
      });

      // 5. Open the downloaded file using native File Opener
      await FileOpener.open({
        filePath: writeResult.uri,
        contentType: 'application/pdf'
      });

    } catch (error: any) {
      console.error('Error downloading or opening file:', error);
      alert(`Failed to open report: ${error.message || 'Unknown error'}`);
      
      // Fallback to web download if native fails (e.g. testing in browser)
      this.webFallbackDownload(url, filename);
    }
  }

  private convertBlobToBase64(blob: Blob): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        // reader.result is a data URL (e.g. "data:application/pdf;base64,JVBERi...")
        // We need to strip the prefix for Capacitor's writeFile if it expects pure base64.
        // Actually, Capacitor 3+ can take the full data URL, but to be safe we'll strip it.
        const result = reader.result as string;
        const base64 = result.split(',')[1]; 
        resolve(base64);
      };
      reader.readAsDataURL(blob);
    });
  }

  private webFallbackDownload(url: string, filename: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
