import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `
    <div class="avatar" [style.width.px]="size" [style.height.px]="size" [style.font-size.px]="size * 0.35">
      <span>{{ initials }}</span>
    </div>
  `,
  styles: [`
    .avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-full);
      background: var(--color-info-bg);
      color: var(--color-info);
      font-weight: var(--font-weight-bold);
      letter-spacing: 0.02em;
      flex-shrink: 0;
      text-transform: uppercase;
      box-shadow: 0 0 0 2px var(--color-surface);
    }
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
}
