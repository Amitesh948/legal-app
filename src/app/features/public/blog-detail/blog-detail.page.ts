import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/angular';
import { ApiService } from '../../../core/services/api.service';
import { Blog } from '../../../core/models/public.model';
import { ImageUrlPipe } from '../../../shared/pipes/image-url/image-url-pipe';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-blog-detail',
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
  templateUrl: './blog-detail.page.html',
  styleUrl: './blog-detail.page.scss'
})
export class BlogDetailPage implements OnInit {
  blog: Blog | null = null;
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
        this.loadBlog(slug);
      }
    });
  }

  loadBlog(slug: string) {
    this.loading = true;
    this.error = false;

    this.api.get<Blog>(`/blogs/${slug}`).subscribe({
      next: (res) => {
        this.blog = res;
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
