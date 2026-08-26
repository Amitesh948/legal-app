import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonContent, IonRefresher, IonRefresherContent, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular';
import { ApiService } from '../../../core/services/api.service';
import { CaseCardComponent } from '../../../shared/components/case-card/case-card.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { CaseStatus, CASE_STATUS_LABELS } from '../../../shared/constants/case-status.constants';

@Component({
  selector: 'app-client-cases',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    IonContent, 
    IonRefresher, 
    IonRefresherContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    CaseCardComponent,
    SkeletonLoaderComponent,
    ErrorStateComponent,
    EmptyStateComponent
  ],
  templateUrl: './client-cases.page.html',
  styleUrl: './client-cases.page.scss'
})
export class ClientCasesPage implements OnInit {
  cases: any[] = [];
  loading = true;
  error = false;
  loadMoreError = false;
  
  filters = [
    { label: 'All', value: 'All' },
    { label: CASE_STATUS_LABELS[CaseStatus.NEW], value: CaseStatus.NEW },
    { label: CASE_STATUS_LABELS[CaseStatus.IN_PROGRESS], value: CaseStatus.IN_PROGRESS },
    { label: CASE_STATUS_LABELS[CaseStatus.COMPLETED], value: CaseStatus.COMPLETED }
  ];
  activeFilter = 'All';
  
  page = 1;
  hasMore = true;

  constructor(
    private api: ApiService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCases();
  }

  setFilter(filterValue: string) {
    this.activeFilter = filterValue;
    this.page = 1;
    this.cases = [];
    this.hasMore = true;
    this.loadCases();
  }

  loadCases(event?: any, isLoadMore = false) {
    if (!isLoadMore) {
      this.loading = true;
      this.error = false;
    }
    this.loadMoreError = false;

    let url = `/cases?page=${this.page}&limit=10`;
    if (this.activeFilter !== 'All') {
      url += `&status=${this.activeFilter}`;
    }

    this.api.get<any>(url)
      .subscribe({
        next: (res) => {
          if (!isLoadMore) this.loading = false;
          
          const newCases = Array.isArray(res) ? res : (res.items || res.data || []);
          
          if (isLoadMore) {
            this.cases = [...this.cases, ...newCases];
          } else {
            this.cases = newCases;
          }
          
          if (newCases.length < 10) {
            this.hasMore = false;
          } else {
            this.page++;
          }
          if (event) event.target.complete();
          this.cdr.detectChanges();
        },
        error: () => {
          if (!isLoadMore) {
            this.loading = false;
            this.error = true;
          } else {
            this.loadMoreError = true;
          }
          if (event) event.target.complete();
          this.cdr.detectChanges();
        }
      });
  }

  doRefresh(event: any) {
    this.page = 1;
    this.hasMore = true;
    this.loadCases(event);
  }

  loadMore(event: any) {
    if (!this.hasMore) {
      event.target.complete();
      return;
    }
    this.loadCases(event, true);
  }

  goToDetail(id: string | number) {
    this.router.navigate(['/client/cases', id]);
  }
}
