import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonInput } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';

type RegistrationStep = 'role' | 'otp-request' | 'otp-verify' | 'details';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonInput],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss'
})
export class RegisterPage {
  currentStep: RegistrationStep = 'role';
  selectedRole: 'client' | 'advocate' = 'client';

  // OTP fields
  email = '';
  otpCode = '';

  // Registration fields
  password = '';
  confirmPassword = '';
  firstName = '';
  lastName = '';
  phone = '';
  address = '';

  showPassword = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  selectRole(role: 'client' | 'advocate'): void {
    this.selectedRole = role;
    this.currentStep = 'otp-request';
    this.errorMessage = '';
  }

  requestOtp(): void {
    this.errorMessage = '';
    if (!this.email) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }

    this.loading = true;
    this.authService.requestOtp({ email: this.email }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'OTP sent to your email address.';
        this.currentStep = 'otp-verify';
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Failed to send OTP.';
      }
    });
  }

  verifyOtp(): void {
    this.errorMessage = '';
    if (!this.otpCode) {
      this.errorMessage = 'Please enter the OTP code.';
      return;
    }

    this.loading = true;
    this.authService.verifyOtp({ email: this.email, otp_code: this.otpCode }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = '';
        this.currentStep = 'details';
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Invalid OTP code.';
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.firstName || !this.lastName || !this.password || !this.phone || !this.address) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    this.loading = true;

    if (this.selectedRole === 'client') {
      this.authService.registerClient({
        email: this.email,
        password: this.password,
        first_name: this.firstName,
        last_name: this.lastName,
        phone: this.phone,
        address: this.address,
        otp_code: this.otpCode
      }).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/auth/login'], {
            queryParams: { registered: 'true' }
          });
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.message || 'Registration failed.';
        }
      });
    } else {
      // Advocate registration requires file uploads — redirect to a note
      this.loading = false;
      this.errorMessage = 'Advocate registration requires document uploads. Please use the web portal or contact support.';
    }
  }

  goBack(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.currentStep === 'details') {
      this.currentStep = 'otp-verify';
    } else if (this.currentStep === 'otp-verify') {
      this.currentStep = 'otp-request';
    } else if (this.currentStep === 'otp-request') {
      this.currentStep = 'role';
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
