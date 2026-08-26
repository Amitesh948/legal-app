import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonRefresher, IonRefresherContent } from '@ionic/angular';
import { ApiService } from '../../../../core/services/api.service';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { TimelineComponent } from '../../../../shared/components/timeline/timeline.component';

@Component({
  selector: 'app-client-case-detail',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    SkeletonLoaderComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    TimelineComponent
  ],
  templateUrl: './case-detail.page.html',
  styleUrl: './case-detail.page.scss'
})
export class ClientCaseDetailPage implements OnInit {
  caseId: string | null = null;
  caseData: any = null;
  timelineEvents: any[] = [];
  
  loading = true;
  error = false;
  
  tabs = ['Overview', 'Documents', 'Messages', 'Opinions'];
  activeTab = 'Overview';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.caseId = this.route.snapshot.paramMap.get('id');
    if (this.caseId) {
      this.loadCaseDetails();
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  loadCaseDetails(event?: any) {
    this.loading = true;
    this.error = false;

    // Simulate joining case data and timeline
    this.api.get<any>(`/cases/${this.caseId}`).subscribe({
      next: (res) => {
        this.caseData = res.data || res;
        this.loadTimeline(event);
      },
      error: () => {
        this.error = true;
        this.loading = false;
        if (event) event.target.complete();
        this.cdr.detectChanges();
      }
    });
  }

  loadTimeline(event?: any) {
    this.api.get<any>(`/cases/${this.caseId}/history`).subscribe({
      next: (res) => {
        this.timelineEvents = Array.isArray(res) ? res : (res.data || []);
        this.loading = false;
        if (event) event.target.complete();
        this.cdr.detectChanges();
      },
      error: () => {
        // Fallback to empty timeline if history fails but case loaded
        this.timelineEvents = [];
        this.loading = false;
        if (event) event.target.complete();
        this.cdr.detectChanges();
      }
    });
  }

  doRefresh(event: any) {
    this.loadCaseDetails(event);
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  get statusClass(): string {
    const s = this.caseData?.status?.toLowerCase() || '';
    if (s === 'open' || s === 'active') return 'badge-info';
    if (s === 'pending' || s === 'in review') return 'badge-warning';
    if (s === 'closed' || s === 'completed') return 'badge-success';
    if (s === 'urgent' || s === 'overdue') return 'badge-danger';
    return 'badge-gray';
  }

  goBack() {
    this.router.navigate(['/client/cases']);
  }
}
