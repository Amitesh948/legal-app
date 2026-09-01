import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseStatus, CASE_STATUS_LABELS } from '../../constants/case-status.constants';

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

  /** Normalize status — strips the Python enum class prefix if the backend
   * sends "CaseStatus.NEW" (audit-log style) instead of clean "NEW".
   * This makes the card resilient both before and after a backend fix. */
  private get normalizedStatus(): string {
    if (!this.status) return '';
    const s = String(this.status);
    return s.includes('.') ? s.split('.').pop()! : s;
  }

  get statusLabel(): string {
    return CASE_STATUS_LABELS[this.normalizedStatus as CaseStatus] || this.normalizedStatus;
  }

  get statusClass(): string {
    switch (this.normalizedStatus as CaseStatus) {
      case CaseStatus.NEW:
      case CaseStatus.AI_PROCESSING:
      case CaseStatus.DOCUMENTS_UPLOADED:
        return 'badge-info';
      case CaseStatus.IN_PROGRESS:
      case CaseStatus.ADVOCATE_ASSIGNED:
      case CaseStatus.LEGAL_REVIEW:
      case CaseStatus.UNDER_REVIEW:
        return 'badge-brand';
      case CaseStatus.PAYMENT_PENDING:
      case CaseStatus.PENDING_ASSIGNMENT:
      case CaseStatus.INFORMATION_REQUIRED:
        return 'badge-warning';
      case CaseStatus.COMPLETED:
      case CaseStatus.PAYMENT_COMPLETED:
      case CaseStatus.REPORT_GENERATED:
      case CaseStatus.OPINION_GENERATED:
        return 'badge-success';
      case CaseStatus.CANCELLED:
      case CaseStatus.CLOSED:
        return 'badge-danger';
      default:
        return 'badge-gray';
    }
  }

  onClick(): void {
    this.cardClick.emit();
  }
}
