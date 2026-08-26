import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-case-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './case-card.component.html',
  styleUrl: './case-card.component.scss'
})
export class CaseCardComponent {
  @Input() caseId!: string | number;
  @Input() title!: string;
  @Input() status!: string;
  @Input() practiceArea!: string;
  @Input() referenceNumber!: string;
  @Input() lastUpdated!: string | Date;
  @Input() hasUnreadMessages: boolean = false;
  
  @Output() cardClick = new EventEmitter<void>();

  get statusClass(): string {
    const s = this.status?.toLowerCase() || '';
    if (s === 'open' || s === 'active') return 'badge-info';
    if (s === 'pending' || s === 'in review') return 'badge-warning';
    if (s === 'closed' || s === 'completed') return 'badge-success';
    if (s === 'urgent' || s === 'overdue') return 'badge-danger';
    return 'badge-gray';
  }

  onClick(): void {
    this.cardClick.emit();
  }
}
