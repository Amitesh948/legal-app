import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
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
