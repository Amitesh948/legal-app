import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { ApiService } from '../../../core/services/api.service';
import { HeroSlider, Testimonial } from '../../../core/models/public.model';
import { ImageUrlPipe } from '../../../shared/pipes/image-url/image-url-pipe';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    IonContent, 
    ImageUrlPipe, 
    SkeletonLoaderComponent, 
    ErrorStateComponent,
    AvatarComponent
  ],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.scss'
})
export class LandingPage implements OnInit {
  sliders: HeroSlider[] = [];
  testimonials: Testimonial[] = [];
  
  loading = true;
  error = false;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = false;

    forkJoin({
      sliders: this.api.get<HeroSlider[]>('/hero-sliders/public'),
      testimonials: this.api.get<Testimonial[]>('/testimonials/public')
    }).subscribe({
      next: (res) => {
        this.sliders = res.sliders || [];
        this.testimonials = res.testimonials || [];
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

  getRouteForTargetUrl(target: string): string {
    // Map known targets to actual routes
    switch (target.toLowerCase()) {
      case 'contact': return '/contact'; // Assuming this exists or falls back cleanly
      case 'cases': return '/public-cases';
      case 'blogs': return '/blogs';
      case 'practice-areas': return '/practice-areas';
      default: return `/${target}`; // Fallback to raw string
    }
  }

  getStars(rating: number): number[] {
    // Return array of length 'rating' up to 5
    const len = Math.min(Math.max(rating, 0), 5);
    return Array(len).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    const len = Math.max(5 - Math.min(Math.max(rating, 0), 5), 0);
    return Array(len).fill(0);
  }
}
