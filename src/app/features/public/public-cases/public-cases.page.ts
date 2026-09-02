import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonSearchbar } from '@ionic/angular';
import { ApiService } from '../../../core/services/api.service';
import { PublicCase } from '../../../core/models/public.model';
import { ImageUrlPipe } from '../../../shared/pipes/image-url/image-url-pipe';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-public-cases',
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
    IonSearchbar,
    ImageUrlPipe,
    SkeletonLoaderComponent,
    ErrorStateComponent,
    EmptyStateComponent
  ],
  templateUrl: './public-cases.page.html',
  styleUrl: './public-cases.page.scss'
})
export class PublicCasesPage implements OnInit {
  allCases: PublicCase[] = [];
  filteredCases: PublicCase[] = [];
  
  loading = true;
  error = false;
  searchQuery = '';

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = false;

    this.api.get<PublicCase[]>('/public-cases/public').subscribe({
      next: (res) => {
        // Defensive filter for active cases
        this.allCases = (res || []).filter(c => (c as any).is_active !== false);
        this.filteredCases = [...this.allCases];
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

  handleSearch(event: any) {
    const query = event.detail.value?.toLowerCase() || '';
    this.searchQuery = query;
    
    if (!query) {
      this.filteredCases = [...this.allCases];
      return;
    }

    this.filteredCases = this.allCases.filter(c => 
      c.title?.toLowerCase().includes(query) || 
      c.summary?.toLowerCase().includes(query) ||
      c.category?.name?.toLowerCase().includes(query) ||
      c.tags?.some(t => t.name?.toLowerCase().includes(query))
    );
  }
}
