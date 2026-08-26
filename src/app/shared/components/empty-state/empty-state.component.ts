import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <div class="empty-state__graphic">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
             stroke="var(--color-gray-400)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path [attr.d]="icon"/>
        </svg>
      </div>
      <h3 class="empty-state__title">{{ title }}</h3>
      <p class="empty-state__message">{{ message }}</p>
      <button *ngIf="actionLabel" class="btn btn-secondary mt-5" (click)="actionClick.emit()">
        {{ actionLabel }}
      </button>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-12) var(--space-6);
      text-align: center;
      background: var(--color-surface);
      border: 1px dashed var(--color-gray-300);
      border-radius: var(--radius-lg);
    }
    .empty-state__graphic {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 96px;
      height: 96px;
      border-radius: var(--radius-full);
      background: var(--brand-50);
      margin-bottom: var(--space-4);
    }
    .empty-state__title {
      font-size: var(--font-size-lg);
      color: var(--color-text-primary);
      margin-bottom: var(--space-2);
    }
    .empty-state__message {
      font-size: var(--font-size-base);
      color: var(--color-text-secondary);
      max-width: 280px;
      margin: 0;
    }
  `]
})
export class EmptyStateComponent {
  @Input() title = 'No data available';
  @Input() message = 'There is nothing to display here right now.';
  @Input() icon = 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z';
  @Input() actionLabel = '';
  @Output() actionClick = new EventEmitter<void>();
}
