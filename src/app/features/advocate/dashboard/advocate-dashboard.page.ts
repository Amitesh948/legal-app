import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-advocate-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <!-- Greeting -->
      <div class="section">
        <h2 class="mb-2">Welcome<span *ngIf="user">, {{ user.first_name }}</span></h2>
        <p>Manage your assigned cases and opinions</p>
      </div>

      <!-- Quick Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div class="stat-card__info">
            <span class="stat-card__value">0</span>
            <span class="stat-card__label">Assigned Cases</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <div class="stat-card__info">
            <span class="stat-card__value">0</span>
            <span class="stat-card__label">Pending Opinions</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="stat-card__info">
            <span class="stat-card__value">0</span>
            <span class="stat-card__label">AI Jobs</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section mt-6">
        <h4 class="mb-4">Quick Actions</h4>
        <div class="d-flex flex-column gap-3">
          <a routerLink="/advocate/cases" class="action-row">
            <div class="action-row__left">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              <span>View Assigned Cases</span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>
          <a routerLink="/advocate/opinions" class="action-row">
            <div class="action-row__left">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              <span>Manage Opinions</span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>
        </div>
      </div>

      <!-- Logout -->
      <div class="section mt-8">
        <button class="btn btn-outline btn-block" (click)="logout()">Sign Out</button>
      </div>
    </div>
  `,
  styleUrl: './advocate-dashboard.page.scss'
})
export class AdvocateDashboardPage implements OnInit {
  user: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
  }
}
