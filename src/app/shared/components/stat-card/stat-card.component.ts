import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card">
      <div class="stat-card__header">
        <div class="stat-card__icon" [ngStyle]="{ background: bgColor, color: iconColor }">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path [attr.d]="icon"/>
          </svg>
        </div>
        <div *ngIf="trend" class="stat-card__trend" [ngClass]="trend > 0 ? 'trend-up' : 'trend-down'">
          <svg *ngIf="trend > 0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          <svg *ngIf="trend < 0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
          <span>{{ math.abs(trend) }}%</span>
        </div>
      </div>
      <div class="stat-card__body">
        <span class="stat-card__value">{{ value }}</span>
        <span class="stat-card__label">{{ label }}</span>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      display: flex;
      flex-direction: column;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      box-shadow: var(--shadow-md);
      transition: box-shadow var(--transition-fast), transform var(--transition-fast);
      height: 100%;
    }
    .stat-card:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }
    .stat-card__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-4);
    }
    .stat-card__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: var(--radius-full);
      flex-shrink: 0;
    }
    .stat-card__body {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .stat-card__value {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      line-height: var(--line-height-none);
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
    }
    .stat-card__label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
    }
    .stat-card__trend {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 12px;
      font-weight: var(--font-weight-semibold);
      padding: 2px 6px;
      border-radius: var(--radius-full);
    }
    .trend-up {
      color: var(--color-success);
      background: var(--color-success-bg);
    }
    .trend-down {
      color: var(--color-danger);
      background: var(--color-danger-bg);
    }
  `]
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: string | number = 0;
  @Input() icon = '';
  @Input() bgColor = 'var(--color-info-bg)';
  @Input() iconColor = 'var(--color-info)';
  @Input() trend?: number;
  
  math = Math;
}
