import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { TokenService } from './token.service';
import {
  User,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  OtpRequest,
  VerifyOtpRequest
} from '../models/user.model';
import { APP_CONSTANTS } from '../constants/app.constants';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private authReady = new BehaviorSubject<boolean>(false);

  currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated$ = this.currentUserSubject.pipe(map(user => !!user));
  authReady$ = this.authReady.asObservable();

  constructor(
    private api: ApiService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  /** Called once during app bootstrap to restore session if token exists. */
  initializeAuth(): Observable<boolean> {
    if (!this.tokenService.hasToken()) {
      this.authReady.next(true);
      return of(false);
    }

    return this.api.get<User>('/auth/me').pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.authReady.next(true);
      }),
      map(() => true),
      catchError(() => {
        this.tokenService.clearTokens();
        this.currentUserSubject.next(null);
        this.authReady.next(true);
        return of(false);
      })
    );
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.api.post<TokenResponse>('/auth/login', credentials).pipe(
      tap(tokens => {
        this.tokenService.setTokens(tokens.access_token, tokens.refresh_token);
      }),
      switchMap(() => this.api.get<User>('/auth/me')),
      tap(user => {
        this.currentUserSubject.next(user);
      })
    );
  }

  requestOtp(data: OtpRequest): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/auth/request-otp', data);
  }

  verifyOtp(data: VerifyOtpRequest): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/auth/verify-otp', data);
  }

  registerClient(data: RegisterRequest): Observable<User> {
    return this.api.post<User>('/auth/register', data);
  }

  logout(): void {
    const refreshToken = this.tokenService.getRefreshToken();
    if (refreshToken) {
      this.api.post('/auth/logout', { refresh_token: refreshToken }).subscribe({
        error: () => { /* Server-side logout failed, proceed anyway */ }
      });
    }
    this.tokenService.clearTokens();
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): string | null {
    return this.currentUserSubject.value?.role ?? null;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }
}
