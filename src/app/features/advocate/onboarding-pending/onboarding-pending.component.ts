import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonLabel, IonButton, IonSpinner, IonText } from '@ionic/angular';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AdvocateStatusService } from '../../../core/services/advocate-status.service';

@Component({
  selector: 'app-onboarding-pending',
  templateUrl: './onboarding-pending.component.html',
  styleUrls: ['./onboarding-pending.component.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, IonLabel, IonButton, IonSpinner, IonText, CommonModule, RouterModule]
})
export class OnboardingPendingComponent implements OnInit {
  isChecking = false;
  statusMode: string = 'UNDER_REVIEW';

  title = 'Application Under Review';
  description = 'Your advocate application has been received and is currently being reviewed by our administrative team. This process typically takes 1-2 business days.';
  statusLabel = 'Pending Approval';
  iconName = 'time-outline';
  iconColor = 'warning';

  constructor(
    private statusService: AdvocateStatusService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.statusMode = params['status'] || 'UNDER_REVIEW';
      
      if (this.statusMode === 'SUSPENDED') {
        this.title = 'Account Suspended';
        this.description = 'Your advocate account has been temporarily suspended by our administrative team. Please contact support for more details.';
        this.statusLabel = 'Suspended';
        this.iconName = 'alert-circle-outline';
        this.iconColor = 'danger';
      } else if (this.statusMode === 'DEACTIVATED') {
        this.title = 'Account Deactivated';
        this.description = 'Your advocate account has been deactivated. You no longer have access to the platform.';
        this.statusLabel = 'Deactivated';
        this.iconName = 'close-circle-outline';
        this.iconColor = 'medium';
      } else if (this.statusMode === 'INACTIVE') {
        this.title = 'Account Inactive';
        this.description = 'Your advocate account is currently inactive. Please contact support to reactivate your account.';
        this.statusLabel = 'Inactive';
        this.iconName = 'pause-circle-outline';
        this.iconColor = 'medium';
      } else if (this.statusMode !== 'UNDER_REVIEW') {
        this.title = 'Account Blocked';
        this.description = `Your account is currently blocked (Status: ${this.statusMode}). Please contact support for more details.`;
        this.statusLabel = 'Blocked';
        this.iconName = 'lock-closed-outline';
        this.iconColor = 'danger';
      }
      this.cdr.detectChanges();
    });
  }

  refreshStatus() {
    this.isChecking = true;
    this.cdr.detectChanges();

    this.statusService.getStatus(true).subscribe({
      next: (res) => {
        this.isChecking = false;
        this.cdr.detectChanges();
        
        if (res?.user?.status === 'ACTIVE') {
          this.router.navigate(['/advocate/home'], { replaceUrl: true });
        }
      },
      error: () => {
        this.isChecking = false;
        this.cdr.detectChanges();
      }
    });
  }
}
