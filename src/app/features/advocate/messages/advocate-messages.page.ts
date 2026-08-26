import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-advocate-messages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="section">
        <h2 class="mb-2">Messages</h2>
        <p>Communicate with clients and administration.</p>
      </div>
      <div class="surface mt-6 p-6 text-center text-muted">
        Secure messaging feature is coming in Sprint 3.
      </div>
    </div>
  `
})
export class AdvocateMessagesPage {}
