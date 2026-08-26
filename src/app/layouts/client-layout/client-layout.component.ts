import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, IonContent],
  template: `
    <div class="app-shell">
      <!-- Top Header -->
      <header class="app-header">
        <div class="app-header__inner">
          <div class="app-header__brand">
            <div class="app-header__logo">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="6" fill="var(--color-primary)"/>
                <path d="M8 8h4v12H8V8zm8 4h4v8h-4v-8z" fill="white"/>
              </svg>
            </div>
            <span class="app-header__title">Legal AI</span>
          </div>
          <div class="app-header__actions">
            <button class="btn-icon" aria-label="Notifications">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="app-main">
        <ion-content>
          <router-outlet></router-outlet>
        </ion-content>
      </main>

      <!-- Bottom Navigation -->
      <nav class="bottom-nav">
        <a routerLink="/client" class="bottom-nav__item"
           [class.active]="isActive('/client', true)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>Home</span>
        </a>
        <a routerLink="/client/cases" class="bottom-nav__item"
           [class.active]="isActive('/client/cases')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <span>Cases</span>
        </a>
        <a routerLink="/client/documents" class="bottom-nav__item"
           [class.active]="isActive('/client/documents')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <span>Docs</span>
        </a>
        <a routerLink="/client/profile" class="bottom-nav__item"
           [class.active]="isActive('/client/profile')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>Profile</span>
        </a>
      </nav>
    </div>
  `,
  styleUrl: './client-layout.component.scss'
})
export class ClientLayoutComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  isActive(path: string, exact = false): boolean {
    if (exact) {
      return this.router.url === path;
    }
    return this.router.url.startsWith(path);
  }
}
