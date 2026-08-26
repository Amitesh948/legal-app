import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { BottomNavComponent, NavItem } from '../../shared/components/bottom-nav/bottom-nav.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, IonContent, BottomNavComponent, AvatarComponent],
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
      <app-bottom-nav [items]="navItems"></app-bottom-nav>
    </div>
  `,
  styleUrl: './client-layout.component.scss'
})
export class ClientLayoutComponent {
  navItems: NavItem[] = [
    {
      label: 'Home',
      route: '/client/home',
      icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      iconFilled: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8h4v8a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z',
      exactMatch: true
    },
    {
      label: 'Cases',
      route: '/client/cases',
      icon: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
      iconFilled: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z'
    },
    {
      label: 'Messages',
      route: '/client/messages',
      icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
      iconFilled: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'
    },
    {
      label: 'Profile',
      route: '/client/profile',
      icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
      iconFilled: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
}
