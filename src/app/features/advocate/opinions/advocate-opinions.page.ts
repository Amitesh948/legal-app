import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-advocate-opinions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="section">
        <h2 class="mb-2">Legal Opinions</h2>
        <p>Draft and submit professional opinions.</p>
      </div>
      <div class="surface mt-6 p-6 text-center text-muted">
        Legal opinions module is coming in a future sprint.
      </div>
    </div>
  `
})
export class AdvocateOpinionsPage {}
