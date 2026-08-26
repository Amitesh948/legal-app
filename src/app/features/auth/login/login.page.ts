import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonInput } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonInput],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPage {
  email = '';
  password = '';
  showPassword = false;
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }

    this.loading = true;

    const credentials: LoginRequest = {
      email: this.email,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (user) => {
        this.loading = false;
        if (user.role === 'advocate') {
          this.router.navigate(['/advocate']);
        } else {
          this.router.navigate(['/client']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Login failed. Please try again.';
      }
    });
  }
}
