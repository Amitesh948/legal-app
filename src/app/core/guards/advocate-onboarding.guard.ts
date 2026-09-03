import { inject } from '@angular/core';
import { Router, CanActivateFn, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AdvocateStatusService } from '../services/advocate-status.service';

export const advocateOnboardingGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const statusService = inject(AdvocateStatusService);

  return statusService.getStatus().pipe(
    map(res => {
      const status = res?.user?.status;
      
      if (status === 'ACTIVE' || status === 'REVIEW_REQUIRED') {
        // Option A: REVIEW_REQUIRED advocates maintain full access to dashboard/messages/cases
        return true;
      }
      
      if (status === 'UNDER_REVIEW') {
        return router.createUrlTree(['/advocate/onboarding-pending'], {
          queryParams: { status: 'UNDER_REVIEW' }
        });
      }
      
      if (status === 'REJECTED') {
        return router.createUrlTree(['/advocate/onboarding-rejected']);
      }
      
      // Fallback for unrecognized status (SUSPENDED, DEACTIVATED)
      return router.createUrlTree(['/advocate/onboarding-pending'], {
        queryParams: { status: status || 'UNKNOWN' }
      });
    }),
    catchError(() => {
      // API call fails -> redirect to login
      return of(router.createUrlTree(['/login']));
    })
  );
};
