import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { BottomNavComponent, NavItem } from '../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-advocate-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, IonContent, BottomNavComponent],
  templateUrl: './advocate-layout.component.html',
  styleUrl: './advocate-layout.component.scss'
})
export class AdvocateLayoutComponent {
  navItems: NavItem[] = [
    {
      label: 'Home',
      route: '/advocate/home',
      icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      iconFilled: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8h4v8a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z',
      exactMatch: true
    },
    {
      label: 'Cases',
      route: '/advocate/cases',
      icon: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
      iconFilled: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z'
    },
    {
      label: 'Messages',
      route: '/advocate/messages',
      icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
      iconFilled: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'
    },
    {
      label: 'Profile',
      route: '/advocate/profile',
      icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
      iconFilled: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
}
