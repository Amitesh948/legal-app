import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonSpinner } from '@ionic/angular';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, catchError } from 'rxjs/operators';
import { ApiService } from '../../../../core/services/api.service';

export interface Citation {
  id: string;
  title: string;
  reference_number: string;
  court: string;
  jurisdiction: string;
  citation_type: string;
  description?: string;
  keywords: string[];
  summary?: string;
  url?: string;
}

@Component({
  selector: 'app-advocate-citations',
  templateUrl: './advocate-citations.page.html',
  styleUrls: ['./advocate-citations.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonSpinner, CommonModule, FormsModule]
})
export class AdvocateCitationsPage implements OnInit, OnDestroy {
  searchQuery = '';
  citations: Citation[] = [];
  loading = false;
  error = false;
  hasSearched = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query.trim()) {
          this.loading = false;
          this.hasSearched = false;
          return of([]);
        }
        this.loading = true;
        this.error = false;
        this.hasSearched = true;
        return this.api.get<Citation[]>(`/citations/search?q=${encodeURIComponent(query)}`).pipe(
          catchError(() => {
            this.error = true;
            this.loading = false;
            return of([]);
          })
        );
      })
    ).subscribe(results => {
      this.citations = results;
      this.loading = false;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(event: any) {
    const query = event.detail.value || '';
    this.searchSubject.next(query);
  }

  openUrl(url?: string) {
    if (url) window.open(url, '_blank');
  }
}
