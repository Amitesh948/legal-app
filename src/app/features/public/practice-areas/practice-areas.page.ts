import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/angular';
import { ApiService } from '../../../core/services/api.service';
import { PracticeArea } from '../../../core/models/public.model';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-practice-areas',
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
    SkeletonLoaderComponent,
    ErrorStateComponent
  ],
  templateUrl: './practice-areas.page.html',
  styleUrl: './practice-areas.page.scss'
})
export class PracticeAreasPage implements OnInit {
  areas: PracticeArea[] = [];
  loading = true;
  error = false;

  constructor(private api: ApiService, private sanitizer: DomSanitizer, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = false;

    this.api.get<PracticeArea[]>('/practice-areas/public').subscribe({
      next: (res) => {
        // Sort by sort_order
        this.areas = (res || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
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

  getSafeSvg(svgString: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svgString);
  }
}
