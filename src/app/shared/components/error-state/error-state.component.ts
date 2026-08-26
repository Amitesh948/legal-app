import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-state.component.html',
  styleUrl: './error-state.component.scss'
})
export class ErrorStateComponent {
  @Input() title = 'Something went wrong';
  @Input() message = 'We were unable to load this content. Please check your connection.';
  @Output() retry = new EventEmitter<void>();
}
