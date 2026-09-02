import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/angular';
import { ApiService } from '../../../core/services/api.service';
import { PublicCase } from '../../../core/models/public.model';
import { ImageUrlPipe } from '../../../shared/pipes/image-url/image-url-pipe';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-public-case-detail',
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
    ImageUrlPipe,
    SkeletonLoaderComponent,
    ErrorStateComponent
  ],
  templateUrl: './public-case-detail.page.html',
  styleUrl: './public-case-detail.page.scss'
})
export class PublicCaseDetailPage implements OnInit {
  publicCase: PublicCase | null = null;
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('id'); // using 'id' in route
      if (slug) {
        this.loadCase(slug);
      }
    });
  }

  loadCase(slug: string) {
    this.loading = true;
    this.error = false;

    this.api.get<PublicCase>(`/public-cases/public/${slug}`).subscribe({
      next: (res) => {
        this.publicCase = res;
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

  getSafeContent(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
