import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-advocate-cases',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="section">
        <h2 class="mb-2">Assigned Cases</h2>
        <p>Manage cases assigned to you.</p>
      </div>
      <div class="surface mt-6 p-6 text-center text-muted">
        Advocate case directory feature is coming in Sprint 3.
      </div>
    </div>
  `
})
export class AdvocateCasesPage {}
