import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-state">
      <div class="error-state__graphic">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h3 class="error-state__title">{{ title }}</h3>
      <p class="error-state__message">{{ message }}</p>
      <button class="btn btn-outline mt-5" (click)="retry.emit()">
        Try Again
      </button>
    </div>
  `,
  styles: [`
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-12) var(--space-6);
      text-align: center;
      background: var(--color-surface);
      border: 1px solid var(--status-danger-bg);
      border-radius: var(--radius-lg);
    }
    .error-state__graphic {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      border-radius: var(--radius-full);
      background: var(--status-danger-bg);
      color: var(--status-danger-text);
      margin-bottom: var(--space-4);
    }
    .error-state__title {
      font-size: var(--font-size-lg);
      color: var(--color-text-primary);
      margin-bottom: var(--space-2);
    }
    .error-state__message {
      font-size: var(--font-size-base);
      color: var(--color-text-secondary);
      max-width: 280px;
      margin: 0;
    }
  `]
})
export class ErrorStateComponent {
  @Input() title = 'Something went wrong';
  @Input() message = 'We were unable to load this content. Please check your connection.';
  @Output() retry = new EventEmitter<void>();
}
