import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="avatar" [style.width.px]="size" [style.height.px]="size" [style.font-size.px]="size * 0.35" [ngClass]="colorVariant">
      <span>{{ initials }}</span>
    </div>
  `,
  styles: [`
    .avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-full);
      font-weight: var(--font-weight-bold);
      letter-spacing: 0.02em;
      flex-shrink: 0;
      text-transform: uppercase;
      box-shadow: 0 0 0 2px var(--color-surface);
    }
    
    .variant-0 { background: var(--brand-50); color: var(--brand-700); }
    .variant-1 { background: var(--status-info-bg); color: var(--status-info-text); }
    .variant-2 { background: var(--status-success-bg); color: var(--status-success-text); }
    .variant-3 { background: var(--status-warning-bg); color: var(--status-warning-text); }
  `]
})
export class AvatarComponent {
  @Input() firstName = '';
  @Input() lastName = '';
  @Input() size = 48;

  get initials(): string {
    const f = this.firstName?.charAt(0) || '';
    const l = this.lastName?.charAt(0) || '';
    return f + l || '?';
  }

  get colorVariant(): string {
    const sum = (this.firstName?.charCodeAt(0) || 0) + (this.lastName?.charCodeAt(0) || 0);
    return `variant-${sum % 4}`;
  }
}
