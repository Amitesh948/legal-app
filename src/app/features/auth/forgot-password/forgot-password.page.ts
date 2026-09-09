import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonInput } from '@ionic/angular';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonInput],
  templateUrl: './forgot-password.page.html',
  styleUrl: './forgot-password.page.scss'
})
export class ForgotPasswordPage {
  email = '';
  loading = false;
  isSubmitted = false;
  errorMessage = '';

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    this.errorMessage = '';
    
    if (!this.email) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.loading = true;

    this.api.post('/auth/forgot-password', { email: this.email }).subscribe({
      next: () => {
        this.loading = false;
        this.isSubmitted = true;
        this.cdr.detectChanges();
      },
      error: () => {
        // Security best practice: Always show success even if the email doesn't exist
        // to prevent email enumeration attacks. The backend actually already does this,
        // but we handle errors just in case of a network issue.
        this.loading = false;
        this.isSubmitted = true;
        this.cdr.detectChanges();
      }
    });
  }
}
