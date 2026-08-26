import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonInput } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { ClientProfile, ClientProfileUpdate } from '../../../core/models/profile.model';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonInput,
    AvatarComponent, SkeletonLoaderComponent, ErrorStateComponent
  ],
  templateUrl: './client-profile.page.html',
  styleUrl: './client-profile.page.scss'
})
export class ClientProfilePage implements OnInit {
  profile: ClientProfile | null = null;
  loading = true;
  error = false;
  
  isEditing = false;
  isSaving = false;
  saveSuccess = false;
  
  editData: ClientProfileUpdate = {
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: ''
  };

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.error = false;
    this.profileService.getClientProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.initEditData();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.error = true;
        this.cdr.detectChanges();
      }
    });
  }

  initEditData(): void {
    if (this.profile?.user) {
      this.editData = {
        first_name: this.profile.user.first_name || '',
        last_name: this.profile.user.last_name || '',
        phone: this.profile.user.phone || '',
        address: this.profile.user.address || '',
        city: this.profile.user.city || '',
        state: this.profile.user.state || '',
        country: this.profile.user.country || '',
        postal_code: this.profile.user.postal_code || ''
      };
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.initEditData(); // Cancel edits
    }
    this.saveSuccess = false;
  }

  saveProfile(): void {
    if (!this.editData.first_name || !this.editData.last_name) return;
    
    this.isSaving = true;
    this.profileService.updateClientProfile(this.editData).subscribe({
      next: (data) => {
        this.profile = data;
        this.isEditing = false;
        this.isSaving = false;
        this.saveSuccess = true;
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.saveSuccess = false;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: () => {
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
