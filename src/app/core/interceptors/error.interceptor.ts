import { HttpInterceptorFn, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { TokenService } from '../services/token.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const http = inject(HttpClient);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Check if it's a 401 error and not a login/refresh attempt itself
      if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          const refreshToken = tokenService.getRefreshToken();

          if (refreshToken) {
            return http.post<{ access_token: string, refresh_token: string }>(`${environment.apiUrl}/auth/refresh`, { refresh_token: refreshToken }).pipe(
              switchMap((tokens) => {
                isRefreshing = false;
                tokenService.setTokens(tokens.access_token, tokens.refresh_token);
                refreshTokenSubject.next(tokens.access_token);
                
                const clonedReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${tokens.access_token}`
                  }
                });
                return next(clonedReq);
              }),
              catchError((err) => {
                isRefreshing = false;
                tokenService.clearTokens();
                router.navigate(['/auth/login']);
                return throwError(() => err);
              })
            );
          } else {
            // No refresh token found, force logout
            isRefreshing = false;
            tokenService.clearTokens();
            router.navigate(['/auth/login']);
            return throwError(() => error);
          }
        } else {
          // If a refresh is already in progress, wait for it to complete
          return refreshTokenSubject.pipe(
            filter(token => token != null),
            take(1),
            switchMap(jwt => {
              const clonedReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${jwt}`
                }
              });
              return next(clonedReq);
            })
          );
        }
      }
      return throwError(() => error);
    })
  );
};
