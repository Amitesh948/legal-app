import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-cases',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="section">
        <h2 class="mb-2">My Cases</h2>
        <p>View and manage your active legal matters.</p>
      </div>
      <div class="surface mt-6 p-6 text-center text-muted">
        Case directory feature is coming in Sprint 3.
      </div>
    </div>
  `
})
export class ClientCasesPage {}
