import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, 
  IonBackButton, IonButton, IonList, IonItem, IonLabel, 
  IonToggle, IonListHeader, IonSpinner 
} from '@ionic/angular';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationPreference } from '../../../core/models/notification.model';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonToggle,
    IonListHeader,
    IonSpinner,
    SkeletonLoaderComponent,
    ErrorStateComponent
  ],
  templateUrl: './notification-settings.page.html',
  styleUrl: './notification-settings.page.scss'
})
export class NotificationSettingsPage implements OnInit {
  preferences: NotificationPreference | null = null;
  
  loading = true;
  error = false;
  
  saving = false;
  saveSuccess = false;
  saveError = false;

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPreferences();
  }

  loadPreferences() {
    this.loading = true;
    this.error = false;
    this.saveSuccess = false;

    this.notificationService.getPreferences().subscribe({
      next: (res) => {
        this.preferences = { ...res };
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

  savePreferences() {
    if (!this.preferences) return;
    
    this.saving = true;
    this.saveSuccess = false;
    this.saveError = false;

    this.notificationService.updatePreferences(this.preferences).subscribe({
      next: (res) => {
        this.preferences = { ...res };
        this.saving = false;
        this.saveSuccess = true;
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.saveSuccess = false;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: () => {
        this.saving = false;
        this.saveError = true;
        this.cdr.detectChanges();
      }
    });
  }
}
