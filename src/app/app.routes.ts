import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { ClientLayoutComponent } from './layouts/client-layout/client-layout.component';
import { AdvocateLayoutComponent } from './layouts/advocate-layout/advocate-layout.component';

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
        loadComponent: () =>
          import('./features/client/cases/client-cases.page').then(m => m.ClientCasesPage)
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
        loadComponent: () =>
          import('./features/advocate/dashboard/advocate-dashboard.page').then(m => m.AdvocateDashboardPage)
      },
      {
        path: 'cases',
        loadComponent: () =>
          import('./features/advocate/cases/advocate-cases.page').then(m => m.AdvocateCasesPage)
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./features/advocate/messages/advocate-messages.page').then(m => m.AdvocateMessagesPage)
      },
      {
        path: 'opinions',
        loadComponent: () =>
          import('./features/advocate/opinions/advocate-opinions.page').then(m => m.AdvocateOpinionsPage)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/advocate/profile/advocate-profile.page').then(m => m.AdvocateProfilePage)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },

  // ── Default Redirect ──
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
