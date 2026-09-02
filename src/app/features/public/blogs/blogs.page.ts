import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular';
import { ApiService } from '../../../core/services/api.service';
import { Blog } from '../../../core/models/public.model';
import { ImageUrlPipe } from '../../../shared/pipes/image-url/image-url-pipe';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';

import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-blogs',
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
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    ImageUrlPipe,
    SkeletonLoaderComponent,
    ErrorStateComponent,
    EmptyStateComponent
  ],
  templateUrl: './blogs.page.html',
  styleUrl: './blogs.page.scss'
})
export class BlogsPage implements OnInit {
  blogs: Blog[] = [];
  loading = true;
  error = false;
  
  // Basic pagination state assuming standard skip/limit API if supported, 
  // but based on Step 0, it just returned an array. We will attempt a limit.
  skip = 0;
  limit = 10;
  hasMore = true;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadBlogs();
  }

  loadBlogs(event?: any) {
    if (!event) {
      this.loading = true;
      this.error = false;
      this.skip = 0;
    }

    this.api.get<Blog[]>('/blogs', { skip: this.skip, limit: this.limit }).subscribe({
      next: (res) => {
        // Defensive filter for "published" status in case backend leaks drafts
        const publishedBlogs = (res || []).filter(b => b.status === 'published');
        
        if (event) {
          this.blogs = [...this.blogs, ...publishedBlogs];
          event.target.complete();
        } else {
          this.blogs = publishedBlogs;
          this.loading = false;
        }

        // If backend returned fewer items than requested limit, we're at the end
        if (publishedBlogs.length < this.limit || !res || res.length === 0) {
          this.hasMore = false;
          if (event) event.target.disabled = true;
        } else {
          this.skip += this.limit;
        }
        
        this.cdr.detectChanges();
      },
      error: () => {
        if (event) {
          event.target.complete();
        } else {
          this.error = true;
          this.loading = false;
        }
        this.cdr.detectChanges();
      }
    });
  }
}
