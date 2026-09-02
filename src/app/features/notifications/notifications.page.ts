import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton, IonIcon } from '@ionic/angular';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationItem } from '../../core/models/notification.model';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    SkeletonLoaderComponent,
    ErrorStateComponent,
    EmptyStateComponent
  ],
  templateUrl: './notifications.page.html',
  styleUrl: './notifications.page.scss'
})
export class NotificationsPage implements OnInit {
  notifications: NotificationItem[] = [];
  loading = true;
  error = false;
  
  constructor(
    private notificationService: NotificationService, 
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = false;

    this.notificationService.getNotifications(0, 100).subscribe({
      next: (res) => {
        this.notifications = res.items || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = true;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
  
  getIconName(type: string): string {
    const norm = this.normalizeType(type);
    switch (norm) {
      case 'success': return 'checkmark-circle';
      case 'warning': return 'warning';
      case 'error': return 'alert-circle';
      case 'info':
      default: return 'information-circle';
    }
  }

  getIconClass(type: string): string {
    return `notif-icon notif-icon--${this.normalizeType(type)}`;
  }
  
  normalizeType(val: any): string {
    if (!val) return 'info';
    let str = String(val).toLowerCase();
    // Defensive check for ClassName.VALUE dirty enum pattern
    if (str.includes('.')) {
      str = str.split('.').pop() || 'info';
    }
    if (['success', 'warning', 'error', 'info'].includes(str)) {
      return str;
    }
    return 'info';
  }

  getTimeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    if (diffMs < 60000) return 'Just now';
    
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }

  handleTap(item: NotificationItem) {
    if (!item.is_read) {
      this.notificationService.markAsRead(item.id).subscribe({
        next: () => {
          item.is_read = true;
          this.cdr.detectChanges();
        },
        error: () => {
          console.error("Failed to mark notification as read");
        }
      });
    }

    if (item.action_url) {
      this.router.navigateByUrl(item.action_url);
    } else if (item.entity_id && item.entity_type) {
      // Basic fallback navigation for known entity types
      const type = String(item.entity_type).toLowerCase();
      if (type.includes('case')) {
        this.router.navigate(['/client/cases', item.entity_id]);
      } else if (type.includes('opinion')) {
        this.router.navigate(['/advocate/opinions', item.entity_id]);
      }
    }
  }

  markAllAsRead() {
    if (this.notifications.length === 0) return;
    
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.is_read = true);
        this.cdr.detectChanges();
      },
      error: () => {
        console.error("Failed to mark all as read");
      }
    });
  }
}
