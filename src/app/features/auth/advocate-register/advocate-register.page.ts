import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonInput, IonTextarea } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';

/** Steps in the advocate registration wizard. */
type WizardStep =
  | 'email-request'
  | 'email-verify'
  | 'personal'
  | 'professional'
  | 'lawfirm'
  | 'documents'
  | 'security'
  | 'terms';

const ORDERED_STEPS: WizardStep[] = [
  'email-request',
  'email-verify',
  'personal',
  'professional',
  'lawfirm',
  'documents',
  'security',
  'terms'
];

export const PRACTICE_AREAS: string[] = [
  'Corporate Law', 'Contract Law', 'Commercial Disputes',
  'Family Law', 'Divorce', 'Child Custody',
  'Criminal Law', 'Criminal Defense', 'Cyber Crime',
  'Employment Law', 'Labour Law',
  'Property Law', 'Real Estate', 'Property Disputes',
  'Personal Injury', 'Motor Accident Claims', 'Insurance Disputes',
  'Civil Law', 'Contract Disputes',
  'Intellectual Property', 'Trademark Law', 'Copyright Law', 'Technology Law'
];

export const PRACTICE_TYPES = [
  'Independent Advocate',
  'Law Firm',
  'Corporate'
];

@Component({
  selector: 'app-advocate-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonInput, IonTextarea],
  templateUrl: './advocate-register.page.html',
  styleUrl: './advocate-register.page.scss'
})
export class AdvocateRegisterPage {

  // ── Step tracking ──
  currentStep: WizardStep = 'email-request';

  // ── UI state ──
  loading = false;
  errorMessage = '';
  successMessage = '';
  isSubmitted = false;

  // ── Constants for template ──
  practiceAreas = PRACTICE_AREAS;
  practiceTypes = PRACTICE_TYPES;

  // ── Form data (matches backend `data` JSON) ──
  email = '';
  otpCode = '';
  firstName = '';
  lastName = '';
  phone = '';
  addressLine1 = '';
  city = '';
  state = '';
  country = '';
  postalCode = '';

  barCouncilNumber = '';
  barCouncilName = '';
  enrollmentDate = '';
  yearsOfExperience: number | null = null;
  practiceType = 'Independent Advocate';
  primaryPracticeAreas: string[] = [];
  professionalSummary = '';

  lawFirmName = '';
  officeAddress = '';
  officePhone = '';
  website = '';
  linkedinUrl = '';
  designation = '';

  password = '';
  confirmPassword = '';
  showPassword = false;

  agreeTerms = false;

  // ── File fields ──
  barCertificateFile: File | null = null;
  photoIdFile: File | null = null;
  photoFile: File | null = null;
  resumeFile: File | null = null;
  degreeFile: File | null = null;

  // Display names for template
  barCertificateName = '';
  photoIdName = '';
  photoName = '';
  resumeName = '';
  degreeName = '';

  constructor(
    private authService: AuthService,
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // ── Step navigation ──

  /** Progress percentage for the step indicator bar */
  get progressPercent(): number {
    const steps = this.getEffectiveSteps();
    const idx = steps.indexOf(this.currentStep);
    if (idx < 0) return 0;
    return Math.round(((idx + 1) / steps.length) * 100);
  }

  get stepLabel(): string {
    const steps = this.getEffectiveSteps();
    const idx = steps.indexOf(this.currentStep);
    return `Step ${idx + 1} of ${steps.length}`;
  }

  /** Returns the step list, skipping 'lawfirm' if practice_type !== 'Law Firm' */
  private getEffectiveSteps(): WizardStep[] {
    if (this.practiceType !== 'Law Firm') {
      return ORDERED_STEPS.filter(s => s !== 'lawfirm');
    }
    return ORDERED_STEPS;
  }

  goNext(): void {
    this.clearMessages();
    const validation = this.validateCurrentStep();
    if (validation) {
      this.errorMessage = validation;
      return;
    }

    const steps = this.getEffectiveSteps();
    const idx = steps.indexOf(this.currentStep);
    if (idx < steps.length - 1) {
      this.currentStep = steps[idx + 1];
    }
  }

  goBack(): void {
    this.clearMessages();
    const steps = this.getEffectiveSteps();
    const idx = steps.indexOf(this.currentStep);
    if (idx > 0) {
      this.currentStep = steps[idx - 1];
    }
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // ── Validation per step ──

  private validateCurrentStep(): string | null {
    switch (this.currentStep) {
      case 'email-request':
        if (!this.email) return 'Please enter your email address.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) return 'Please enter a valid email address.';
        return null;

      case 'email-verify':
        if (!this.otpCode) return 'Please enter the OTP code.';
        if (this.otpCode.length !== 6) return 'OTP code must be 6 digits.';
        return null;

      case 'personal':
        if (!this.firstName.trim()) return 'First name is required.';
        if (!this.lastName.trim()) return 'Last name is required.';
        if (!this.phone.trim()) return 'Phone number is required.';
        if (!this.addressLine1.trim()) return 'Address is required.';
        return null;

      case 'professional':
        if (!this.barCouncilNumber.trim()) return 'Bar Council Number is required.';
        if (!this.barCouncilName.trim()) return 'Bar Council Name is required.';
        if (!this.enrollmentDate) return 'Enrollment date is required.';
        if (this.yearsOfExperience === null || this.yearsOfExperience < 0) return 'Years of experience is required.';
        if (!this.practiceType) return 'Practice type is required.';
        if (this.primaryPracticeAreas.length === 0) return 'Select at least one practice area.';
        return null;

      case 'lawfirm':
        if (!this.lawFirmName.trim()) return 'Law firm name is required.';
        return null;

      case 'documents':
        if (!this.barCertificateFile) return 'Bar Certificate is required.';
        if (!this.photoIdFile) return 'Photo ID is required.';
        if (!this.photoFile) return 'Profile photo is required.';
        return null;

      case 'security':
        if (!this.password) return 'Password is required.';
        if (this.password.length < 8) return 'Password must be at least 8 characters.';
        if (this.password !== this.confirmPassword) return 'Passwords do not match.';
        return null;

      case 'terms':
        if (!this.agreeTerms) return 'You must agree to the terms and conditions.';
        return null;

      default:
        return null;
    }
  }

  // ── OTP flow ──

  requestOtp(): void {
    this.clearMessages();
    const emailErr = this.validateCurrentStep();
    if (emailErr) {
      this.errorMessage = emailErr;
      return;
    }

    this.loading = true;
    this.authService.requestOtp({ email: this.email }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'OTP sent to your email address.';
        this.currentStep = 'email-verify';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Failed to send OTP.';
        this.cdr.detectChanges();
      }
    });
  }

  verifyOtp(): void {
    this.clearMessages();
    const otpErr = this.validateCurrentStep();
    if (otpErr) {
      this.errorMessage = otpErr;
      return;
    }

    this.loading = true;
    this.authService.verifyOtp({ email: this.email, otp_code: this.otpCode }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = '';
        this.currentStep = 'personal';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Invalid OTP code.';
        this.cdr.detectChanges();
      }
    });
  }

  // ── Practice area toggle ──

  togglePracticeArea(area: string): void {
    const idx = this.primaryPracticeAreas.indexOf(area);
    if (idx >= 0) {
      this.primaryPracticeAreas.splice(idx, 1);
    } else {
      this.primaryPracticeAreas.push(area);
    }
  }

  isPracticeAreaSelected(area: string): boolean {
    return this.primaryPracticeAreas.includes(area);
  }

  // ── File handling ──

  onFileSelected(event: Event, field: 'barCertificate' | 'photoId' | 'photo' | 'resume' | 'degree'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    switch (field) {
      case 'barCertificate':
        this.barCertificateFile = file;
        this.barCertificateName = file.name;
        break;
      case 'photoId':
        this.photoIdFile = file;
        this.photoIdName = file.name;
        break;
      case 'photo':
        this.photoFile = file;
        this.photoName = file.name;
        break;
      case 'resume':
        this.resumeFile = file;
        this.resumeName = file.name;
        break;
      case 'degree':
        this.degreeFile = file;
        this.degreeName = file.name;
        break;
    }
  }

  // ── Password visibility toggle ──

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // ── Final submission ──

  submitApplication(): void {
    this.clearMessages();

    // Final validation
    const termsErr = this.validateCurrentStep();
    if (termsErr) {
      this.errorMessage = termsErr;
      return;
    }

    this.loading = true;

    // ── Build the JSON data payload ──
    // Field names MUST match what the backend reads from `data.get(...)`
    const jsonData: Record<string, unknown> = {
      email: this.email,
      otp_code: this.otpCode,
      password: this.password,
      first_name: this.firstName,
      last_name: this.lastName,
      phone: this.phone,
      address_line_1: this.addressLine1,   // NOT "address" — backend reads "address_line_1"
      city: this.city || undefined,
      state: this.state || undefined,
      country: this.country || undefined,
      postal_code: this.postalCode || undefined,
      bar_council_number: this.barCouncilNumber,
      bar_council_name: this.barCouncilName,
      enrollment_date: this.enrollmentDate,
      years_of_experience: this.yearsOfExperience ?? 0,
      practice_type: this.practiceType,
      primary_practice_areas: this.primaryPracticeAreas,
      secondary_practice_areas: [],
      languages_spoken: [],
      professional_summary: this.professionalSummary || undefined,
      law_firm_name: this.lawFirmName || undefined,
      office_address: this.officeAddress || undefined,
      office_phone: this.officePhone || undefined,
      website: this.website || undefined,
      linkedin_url: this.linkedinUrl || undefined,
      designation: this.designation || undefined
    };

    // ── Build multipart FormData ──
    // The backend expects:
    //   - "data"            : Form(...) — the JSON string
    //   - "bar_certificate" : File(...) — required
    //   - "photo_id"        : File(...) — required
    //   - "photo"           : File(...) — required
    //   - "resume"          : File(None) — optional
    //   - "degree"          : File(None) — optional
    //
    // Do NOT set Content-Type header manually — let the browser set the
    // multipart boundary automatically. ApiService.postFormData already
    // does this correctly.

    const formData = new FormData();
    formData.append('data', JSON.stringify(jsonData));
    formData.append('bar_certificate', this.barCertificateFile!);
    formData.append('photo_id', this.photoIdFile!);
    formData.append('photo', this.photoFile!);

    if (this.resumeFile) {
      formData.append('resume', this.resumeFile);
    }
    if (this.degreeFile) {
      formData.append('degree', this.degreeFile);
    }

    this.api.postFormData<{ message: string; application_id: string }>(
      '/auth/advocate/register',
      formData
    ).subscribe({
      next: () => {
        this.loading = false;
        this.isSubmitted = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Registration failed. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
