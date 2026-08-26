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
  templateUrl: './bottom-nav.component.html',
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
