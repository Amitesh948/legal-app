import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss'
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
