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
        path: '',
        loadComponent: () =>
          import('./features/client/dashboard/client-dashboard.page').then(m => m.ClientDashboardPage)
      },
      // Future Sprint routes will be added here:
      // { path: 'cases', ... },
      // { path: 'cases/:id', ... },
      // { path: 'documents', ... },
      // { path: 'profile', ... },
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
        path: '',
        loadComponent: () =>
          import('./features/advocate/dashboard/advocate-dashboard.page').then(m => m.AdvocateDashboardPage)
      },
      // Future Sprint routes will be added here:
      // { path: 'cases', ... },
      // { path: 'cases/:id', ... },
      // { path: 'opinions', ... },
      // { path: 'profile', ... },
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
