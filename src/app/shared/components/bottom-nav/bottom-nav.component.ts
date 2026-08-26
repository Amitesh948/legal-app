import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

export interface NavItem {
  label: string;
  route: string;
  icon: string; // SVG path data
  iconFilled?: string; // Optional filled SVG path for active state
  exactMatch?: boolean;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="bottom-nav" role="navigation" aria-label="Main navigation">
      <div class="bottom-nav__inner">
        <a *ngFor="let item of items"
           [routerLink]="item.route"
           class="bottom-nav__item"
           [class.active]="isActive(item)"
           [attr.aria-label]="item.label"
           [attr.aria-current]="isActive(item) ? 'page' : null">
          
          <div class="bottom-nav__icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                 [attr.stroke]="isActive(item) && !item.iconFilled ? 'currentColor' : 'currentColor'"
                 [attr.fill]="isActive(item) && item.iconFilled ? 'currentColor' : 'none'"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path [attr.d]="isActive(item) && item.iconFilled ? item.iconFilled : item.icon"/>
            </svg>
          </div>
          <span>{{ item.label }}</span>
        </a>
      </div>
    </nav>
  `,
  styleUrl: './bottom-nav.component.scss'
})
export class BottomNavComponent {
  @Input() items: NavItem[] = [];

  constructor(private router: Router) {}

  isActive(item: NavItem): boolean {
    if (item.exactMatch) {
      return this.router.url === item.route;
    }
    return this.router.url.startsWith(item.route);
  }
}
