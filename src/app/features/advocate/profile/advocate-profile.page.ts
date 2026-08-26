import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonInput, IonTextarea } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { AdvocateFullProfile } from '../../../core/models/profile.model';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-advocate-profile',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonInput, IonTextarea,
    AvatarComponent, SkeletonLoaderComponent, ErrorStateComponent
  ],
  templateUrl: './advocate-profile.page.html',
  styleUrl: './advocate-profile.page.scss'
})
export class AdvocateProfilePage implements OnInit {
  fullProfile: AdvocateFullProfile | null = null;
  loading = true;
  error = false;
  
  isEditing = false;
  isSaving = false;
  saveSuccess = false;
  
  editData: any = {};

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
    this.profileService.getAdvocateProfile().subscribe({
      next: (data) => {
        this.fullProfile = data;
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
    if (this.fullProfile?.user) {
      this.editData = {
        first_name: this.fullProfile.user.first_name || '',
        last_name: this.fullProfile.user.last_name || '',
        phone: this.fullProfile.user.phone || '',
        address: this.fullProfile.user.address || '',
        city: this.fullProfile.user.city || '',
        state: this.fullProfile.user.state || '',
        country: this.fullProfile.user.country || '',
        postal_code: this.fullProfile.user.postal_code || '',
        // Professional Info
        bar_council_number: this.fullProfile.profile?.bar_council_number || '',
        bar_council_name: this.fullProfile.profile?.bar_council_name || '',
        enrollment_date: this.fullProfile.profile?.enrollment_date || '',
        years_of_experience: this.fullProfile.profile?.years_of_experience || 0,
        practice_type: this.fullProfile.profile?.practice_type || 'INDIVIDUAL',
        designation: this.fullProfile.profile?.designation || '',
        professional_summary: this.fullProfile.profile?.professional_summary || '',
        law_firm_name: this.fullProfile.profile?.law_firm_name || ''
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
    
    // Convert comma-separated string back to array if needed (simplified for this demo)
    const payload = {
      ...this.editData,
      primary_practice_areas: this.fullProfile?.profile?.primary_practice_areas || ['General Practice']
    };

    this.isSaving = true;
    this.profileService.updateAdvocateProfile(payload).subscribe({
      next: (data) => {
        this.fullProfile = data;
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
