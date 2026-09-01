import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonInput, IonTextarea } from '@ionic/angular';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-new-case',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonInput, IonTextarea],
  templateUrl: './new-case.page.html',
  styleUrl: './new-case.page.scss'
})
export class NewCasePage {
  currentStep = 1;
  totalSteps = 3;
  isSubmitting = false;
  submitError = '';

  // Form Data
  selectedPracticeAreaId: number | null = null;
  caseTitle: string = '';
  caseDescription: string = '';
  attachedFile: File | null = null;

  practiceAreas = [
    { id: 1, name: 'Family Law', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' },
    { id: 2, name: 'Corporate Law', icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
    { id: 3, name: 'Real Estate', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { id: 4, name: 'Criminal Defense', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { id: 5, name: 'Immigration', icon: 'M2 12h4l2-9 4 18 2-9h4' },
    { id: 6, name: 'Other', icon: 'M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' }
  ];

  constructor(private api: ApiService, private router: Router) {}

  get canProceed(): boolean {
    if (this.currentStep === 1) return this.selectedPracticeAreaId !== null;
    if (this.currentStep === 2) return this.caseTitle.trim().length > 0 && this.caseDescription.trim().length > 0;
    return true;
  }

  get selectedPracticeAreaName(): string {
    return this.practiceAreas.find(p => p.id === this.selectedPracticeAreaId)?.name || '';
  }

  selectPracticeArea(id: number) {
    this.selectedPracticeAreaId = id;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.attachedFile = file;
    }
  }

  nextStep() {
    if (this.canProceed && this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    } else {
      this.router.navigate(['/client/cases']);
    }
  }

  submitCase() {
    if (!this.canProceed) return;
    
    this.isSubmitting = true;
    this.submitError = '';

    const payload = {
      category: this.selectedPracticeAreaName,
      title: this.caseTitle,
      description: this.caseDescription,
      // In a real app, file upload might be handled via FormData or a separate endpoint
    };

    this.api.post<any>('/cases', payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
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
      }
    });
  }
}
