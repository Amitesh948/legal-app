import { Injectable } from '@angular/core';
import { APP_CONSTANTS } from '../constants/app.constants';

@Injectable({ providedIn: 'root' })
export class TokenService {

  getAccessToken(): string | null {
    return localStorage.getItem(APP_CONSTANTS.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(APP_CONSTANTS.refreshTokenKey);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(APP_CONSTANTS.tokenKey, accessToken);
    localStorage.setItem(APP_CONSTANTS.refreshTokenKey, refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem(APP_CONSTANTS.tokenKey);
    localStorage.removeItem(APP_CONSTANTS.refreshTokenKey);
  }

  hasToken(): boolean {
    return !!this.getAccessToken();
  }
}
