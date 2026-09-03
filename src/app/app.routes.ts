import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { ClientLayoutComponent } from './layouts/client-layout/client-layout.component';
import { AdvocateLayoutComponent } from './layouts/advocate-layout/advocate-layout.component';
import { advocateOnboardingGuard } from './core/guards/advocate-onboarding.guard';
import { advocateNewCaseGuard } from './core/guards/advocate-new-case.guard';

export const routes: Routes = [
  // ── Auth Routes ──
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.page').then(m => m.LoginPage)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.page').then(m => m.RegisterPage)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  // ── Client Routes ──
  {
    path: 'client',
    component: ClientLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['client'] },
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./features/client/dashboard/client-dashboard.page').then(m => m.ClientDashboardPage)
      },
      {
        path: 'cases',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/client/cases/client-cases.page').then(m => m.ClientCasesPage)
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/client/cases/new-case/new-case.page').then(m => m.NewCasePage)
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/client/cases/case-detail/case-detail.page').then(m => m.ClientCaseDetailPage)
          }
        ]
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/client/payments/client-payments.page').then(m => m.ClientPaymentsPage)
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./features/client/messages/client-messages.page').then(m => m.ClientMessagesPage)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/client/profile/client-profile.page').then(m => m.ClientProfilePage)
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/notifications.page').then(m => m.NotificationsPage)
      },
      {
        path: 'settings/notifications',
        loadComponent: () =>
          import('./features/settings/notification-settings/notification-settings.page').then(m => m.NotificationSettingsPage)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },

  // ── Advocate Routes ──
  {
    path: 'advocate',
    component: AdvocateLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['advocate'] },
    children: [
      {
        path: 'home',
        canActivate: [advocateOnboardingGuard],
        loadComponent: () =>
          import('./features/advocate/dashboard/advocate-dashboard.page').then(m => m.AdvocateDashboardPage)
      },
      {
        path: 'cases',
        canActivate: [advocateOnboardingGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/advocate/cases/advocate-cases.page').then(m => m.AdvocateCasesPage)
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/advocate/cases/case-detail/case-detail.page').then(m => m.AdvocateCaseDetailPage)
          }
        ]
      },
      {
        path: 'messages',
        canActivate: [advocateOnboardingGuard],
        loadComponent: () =>
          import('./features/advocate/messages/advocate-messages.page').then(m => m.AdvocateMessagesPage)
      },
      {
        path: 'opinions',
        canActivate: [advocateOnboardingGuard],
        loadComponent: () =>
          import('./features/advocate/opinions/advocate-opinions.page').then(m => m.AdvocateOpinionsPage)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/advocate/profile/advocate-profile.page').then(m => m.AdvocateProfilePage)
      },
      {
        path: 'notifications',
        canActivate: [advocateOnboardingGuard],
        loadComponent: () =>
          import('./features/notifications/notifications.page').then(m => m.NotificationsPage)
      },
      {
        path: 'settings/notifications',
        loadComponent: () =>
          import('./features/settings/notification-settings/notification-settings.page').then(m => m.NotificationSettingsPage)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'advocate/onboarding-pending',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['advocate'] },
    loadComponent: () =>
      import('./features/advocate/onboarding-pending/onboarding-pending.component').then(m => m.OnboardingPendingComponent)
  },
  {
    path: 'advocate/onboarding-rejected',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['advocate'] },
    loadComponent: () =>
      import('./features/advocate/onboarding-rejected/onboarding-rejected.component').then(m => m.OnboardingRejectedComponent)
  },

  // ── Public Routes (Phase 5) ──
  {
    path: '',
    loadComponent: () => import('./features/public/landing/landing.page').then( m => m.LandingPage),
    pathMatch: 'full'
  },
  {
    path: 'practice-areas',
    loadComponent: () => import('./features/public/practice-areas/practice-areas.page').then( m => m.PracticeAreasPage)
  },
  {
    path: 'blogs',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/public/blogs/blogs.page').then( m => m.BlogsPage)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/public/blog-detail/blog-detail.page').then( m => m.BlogDetailPage)
      }
    ]
  },
  {
    path: 'public-cases',
    canActivate: [advocateNewCaseGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/public/public-cases/public-cases.page').then( m => m.PublicCasesPage)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/public/public-case-detail/public-case-detail.page').then( m => m.PublicCaseDetailPage)
      }
    ]
  },
  {
    path: 'advocate-citations',
    loadComponent: () => import('./features/advocate/citations/advocate-citations/advocate-citations.page').then( m => m.AdvocateCitationsPage)
  },
  
  // ── Default Redirect ──
  {
    path: '**',
    redirectTo: ''
  }
];
