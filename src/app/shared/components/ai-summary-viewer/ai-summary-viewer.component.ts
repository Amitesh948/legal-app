import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiSummary } from '../../../core/services/document.service';

@Component({
  selector: 'app-ai-summary-viewer',
  templateUrl: './ai-summary-viewer.component.html',
  styleUrls: ['./ai-summary-viewer.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class AiSummaryViewerComponent {
  @Input() summary: AiSummary | null = null;

  hasValidArray(arr: any[] | undefined | null): boolean {
    return Array.isArray(arr) && arr.length > 0;
  }

  hasValidString(str: string | undefined | null): boolean {
    return typeof str === 'string' && str.trim().length > 0;
  }
}
