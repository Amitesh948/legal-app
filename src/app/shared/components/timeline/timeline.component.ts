import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TimelineEvent {
  id: string | number;
  title: string;
  description: string;
  timestamp: string | Date;
  type: 'status_change' | 'document_added' | 'message_received' | 'opinion_delivered' | 'general';
}

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss'
})
export class TimelineComponent {
  @Input() events: TimelineEvent[] = [];
  
  getDotClass(type: string): string {
    switch(type) {
      case 'status_change': return 'dot-info';
      case 'document_added': return 'dot-brand';
      case 'opinion_delivered': return 'dot-success';
      case 'message_received': return 'dot-warning';
      default: return 'dot-gray';
    }
  }
}
