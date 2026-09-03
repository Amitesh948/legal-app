import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent, IonInput, IonTextarea } from '@ionic/angular';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from '../../../../core/services/api.service';
import { PracticeArea } from '../../../../core/models/public.model';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-new-case',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonInput, IonTextarea, SkeletonLoaderComponent, ErrorStateComponent],
  templateUrl: './new-case.page.html',
  styleUrl: './new-case.page.scss'
})
export class NewCasePage implements OnInit {
  currentStep = 1;
  totalSteps = 3;
  isSubmitting = false;
  submitError = '';

  loadingAreas = true;
  areasError = false;

  // Form Data
  selectedPracticeAreaId: string | null = null;
  caseTitle: string = '';
  caseDescription: string = '';
  attachedFile: File | null = null;

  practiceAreas: PracticeArea[] = [];

  constructor(
    private api: ApiService, 
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadPracticeAreas();
  }

  loadPracticeAreas() {
    this.loadingAreas = true;
    this.areasError = false;
    this.cdr.detectChanges();

    this.api.get<PracticeArea[]>('/practice-areas/public').subscribe({
      next: (res) => {
        this.practiceAreas = (res || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        this.loadingAreas = false;
        this.checkPrefill();
        this.cdr.detectChanges();
      },
      error: () => {
        this.areasError = true;
        this.loadingAreas = false;
        this.cdr.detectChanges();
      }
    });
  }

  checkPrefill() {
    const prefill = this.route.snapshot.queryParams['prefill_area'];
    if (prefill) {
      // prefill is now the direct UUID from the public page
      const match = this.practiceAreas.find(p => p.id === prefill);
      if (match) {
        this.selectedPracticeAreaId = match.id;
      }
    }
  }

  getSafeSvg(svgString: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svgString);
  }

  get canProceed(): boolean {
    if (this.currentStep === 1) return this.selectedPracticeAreaId !== null;
    if (this.currentStep === 2) return this.caseTitle.trim().length > 0 && this.caseDescription.trim().length > 0;
    return true;
  }

  get selectedPracticeAreaName(): string {
    return this.practiceAreas.find(p => p.id === this.selectedPracticeAreaId)?.title || '';
  }

  selectPracticeArea(id: string) {
    this.selectedPracticeAreaId = id;
    this.cdr.detectChanges();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.attachedFile = file;
      this.cdr.detectChanges();
    }
  }

  nextStep() {
    if (this.canProceed && this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.cdr.detectChanges();
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.cdr.detectChanges();
    } else {
      this.router.navigate(['/client/cases']);
    }
  }

  submitCase() {
    if (!this.canProceed) return;
    
    this.isSubmitting = true;
    this.submitError = '';
    this.cdr.detectChanges();

    const payload = {
      category: this.selectedPracticeAreaName,
      title: this.caseTitle,
      description: this.caseDescription,
    };

    this.api.post<any>('/cases', payload).pipe(
      switchMap((res) => {
        const newCaseId = res.id || res.data?.id;
        if (this.attachedFile && newCaseId) {
          // Upload document to the separate documents endpoint
          const formData = new FormData();
          formData.append('case_id', newCaseId);
          formData.append('category', 'OTHER');
          formData.append('file', this.attachedFile, this.attachedFile.name);
          return this.api.postFormData<any>('/documents/upload', formData).pipe(
            switchMap(() => of(res)) // Return the original case response after upload
          );
        }
        return of(res);
      })
    ).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
        const newCaseId = res.id || res.data?.id;
        if (newCaseId) {
          this.router.navigate(['/client/cases', newCaseId]);
        } else {
          this.router.navigate(['/client/cases']);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err.message || 'Failed to create case. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }
}
