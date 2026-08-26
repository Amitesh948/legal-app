import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <!-- Greeting -->
      <div class="section">
        <h2 class="mb-2">Welcome back<span *ngIf="user">, {{ user.first_name }}</span></h2>
        <p>Here's your case overview</p>
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
            <span class="stat-card__label">Active Cases</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div class="stat-card__info">
            <span class="stat-card__value">0</span>
            <span class="stat-card__label">Documents</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div class="stat-card__info">
            <span class="stat-card__value">0</span>
            <span class="stat-card__label">Messages</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section mt-6">
        <h4 class="mb-4">Quick Actions</h4>
        <div class="d-flex flex-column gap-3">
          <a routerLink="/client/cases" class="action-row">
            <div class="action-row__left">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              <span>View My Cases</span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>
          <a routerLink="/client/documents" class="action-row">
            <div class="action-row__left">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span>My Documents</span>
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
  styleUrl: './client-dashboard.page.scss'
})
export class ClientDashboardPage implements OnInit {
  user: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
  }
}
