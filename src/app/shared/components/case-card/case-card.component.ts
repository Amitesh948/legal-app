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

  get statusLabel(): string {
    return CASE_STATUS_LABELS[this.status as CaseStatus] || this.status;
  }

  get statusClass(): string {
    switch (this.status as CaseStatus) {
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
