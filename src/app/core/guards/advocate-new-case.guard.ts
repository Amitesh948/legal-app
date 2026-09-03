import { inject } from '@angular/core';
import { Router, CanActivateFn, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AdvocateStatusService } from '../services/advocate-status.service';
import { AuthService } from '../services/auth.service';

export const advocateNewCaseGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const statusService = inject(AdvocateStatusService);
  const authService = inject(AuthService);

  const user = authService.getCurrentUser();
  if (user?.role !== 'advocate') {
    return of(true);
  }

  return statusService.getStatus().pipe(
    map(res => {
      const status = res?.user?.status;
      
      if (status === 'ACTIVE') {
        return true;
      }
      
      if (status === 'REVIEW_REQUIRED') {
        return router.createUrlTree(['/advocate/home'], {
          queryParams: { blocked: 'new_case' }
        });
      }
      
      return router.createUrlTree(['/advocate/home']);
    }),
    catchError(() => of(true))
  );
};
