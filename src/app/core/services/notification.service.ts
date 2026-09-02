import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { NotificationListResponse, NotificationPreference } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private api: ApiService) {}

  getNotifications(skip: number = 0, limit: number = 100): Observable<NotificationListResponse> {
    return this.api.get<NotificationListResponse>('/notifications', { skip, limit }).pipe(
      tap(res => {
        if (res && typeof res.unread_count === 'number') {
          this.unreadCountSubject.next(res.unread_count);
        }
      })
    );
  }

  markAsRead(id: string): Observable<any> {
    return this.api.patch<any>(`/notifications/${id}/read`, {}).pipe(
      tap(() => {
        // Optimistically decrement count
        const current = this.unreadCountSubject.value;
        if (current > 0) {
          this.unreadCountSubject.next(current - 1);
        }
      })
    );
  }

  markAllAsRead(): Observable<any> {
    return this.api.patch<any>('/notifications/read-all', {}).pipe(
      tap(() => {
        this.unreadCountSubject.next(0);
      })
    );
  }
  
  getPreferences(): Observable<NotificationPreference> {
    return this.api.get<NotificationPreference>('/notifications/preferences');
  }
  
  updatePreferences(prefs: Partial<NotificationPreference>): Observable<NotificationPreference> {
    return this.api.put<NotificationPreference>('/notifications/preferences', prefs);
  }

  refreshUnreadCount(): void {
    // A lightweight fetch if needed, though getNotifications updates it.
    // We can just call getNotifications with limit=1 to get the count.
    this.getNotifications(0, 1).subscribe();
  }
  
  updateUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }
}
