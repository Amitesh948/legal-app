import { Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  template: `
    <div class="skeleton-group">
      <!-- Header mimic -->
      <div class="skeleton skeleton--header">
        <div class="skeleton--avatar"></div>
        <div class="skeleton--text-group">
          <div class="skeleton--text short"></div>
          <div class="skeleton--text long"></div>
        </div>
      </div>
      
      <!-- Stats grid mimic -->
      <div class="skeleton-grid">
        <div class="skeleton skeleton--card"></div>
        <div class="skeleton skeleton--card"></div>
        <div class="skeleton skeleton--card"></div>
        <div class="skeleton skeleton--card"></div>
      </div>
      
      <!-- List mimic -->
      <div class="skeleton skeleton--list-item"></div>
      <div class="skeleton skeleton--list-item"></div>
      <div class="skeleton skeleton--list-item"></div>
    </div>
  `,
  styles: [`
    .skeleton-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }
    .skeleton {
      background: linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-50) 50%, var(--color-gray-100) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
      border-radius: var(--radius-md);
    }
    
    .skeleton--header {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      background: none;
      animation: none;
    }
    .skeleton--avatar {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-full);
      background: inherit;
      animation: inherit;
      background: var(--color-gray-200);
      animation: shimmer 1.5s ease-in-out infinite;
    }
    .skeleton--text-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .skeleton--text {
      height: 12px;
      border-radius: var(--radius-full);
      background: var(--color-gray-200);
      animation: shimmer 1.5s ease-in-out infinite;
    }
    .skeleton--text.short { width: 40%; }
    .skeleton--text.long { width: 70%; height: 16px; }

    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-3);
    }
    @media (min-width: 768px) {
      .skeleton-grid { grid-template-columns: repeat(4, 1fr); }
    }
    
    .skeleton--card {
      height: 100px;
      border-radius: var(--radius-lg);
    }
    
    .skeleton--list-item {
      height: 64px;
      border-radius: var(--radius-lg);
      margin-bottom: var(--space-2);
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `]
})
export class SkeletonLoaderComponent {}
