import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { filter, map, take } from 'rxjs/operators';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[];

  return authService.authReady$.pipe(
    filter(ready => ready),
    take(1),
    map(() => {
      const userRole = authService.getUserRole();

      if (!userRole) {
        router.navigate(['/auth/login']);
        return false;
      }

      if (requiredRoles && requiredRoles.includes(userRole)) {
        return true;
      }

      // Redirect to the user's correct area
      if (userRole === 'client') {
        router.navigate(['/client']);
      } else if (userRole === 'advocate') {
        router.navigate(['/advocate']);
      } else {
        router.navigate(['/auth/login']);
      }
      return false;
    })
  );
};
