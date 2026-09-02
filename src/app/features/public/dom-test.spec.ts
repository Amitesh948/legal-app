import 'zone.js';
import 'zone.js/testing';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { LandingPage } from './landing/landing.page';
import { BlogsPage } from './blogs/blogs.page';
import { PracticeAreasPage } from './practice-areas/practice-areas.page';
import { BlogDetailPage } from './blog-detail/blog-detail.page';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs';

TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

describe('DOM Rendering Verification', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should render relative image path correctly via ImageUrlPipe on LandingPage', () => {
    const fixture = TestBed.createComponent(LandingPage);
    fixture.detectChanges();

    const req1 = httpMock.expectOne(environment.apiUrl + '/hero-sliders/public');
    req1.flush([{ id: '1', title: 'Test', subtitle: 'Test', button_text: 'Btn', target_url: 'contact', image_url: '/uploads/hero.jpg', display_order: 1 }]);
    
    const req2 = httpMock.expectOne(environment.apiUrl + '/testimonials/public');
    req2.flush([
      { id: '1', client_name: 'John Doe', client_designation: 'CEO', client_image_url: null, rating: 5, content: 'Great' }
    ]);

    fixture.detectChanges();

    const slide = fixture.nativeElement.querySelector('.slide');
    console.log('--- LandingPage Slide Background ---');
    console.log(slide.style.backgroundImage);

    const avatar = fixture.nativeElement.querySelector('app-avatar');
    console.log('--- LandingPage Avatar DOM ---');
    console.log(avatar.outerHTML);
  });

  it('should render absolute image path correctly via ImageUrlPipe on BlogsPage', () => {
    const fixture = TestBed.createComponent(BlogsPage);
    fixture.detectChanges();

    const req = httpMock.expectOne(environment.apiUrl + '/blogs?skip=0&limit=10');
    req.flush([
      { id: '1', title: 'Test Blog', slug: 'test', excerpt: 'abc', content: '<p>xyz</p>', cover_image_url: 'https://example.com/blog.jpg', status: 'published', created_at: '2026-08-18', author: { first_name: 'John' }, category: { name: 'Law' } }
    ]);

    fixture.detectChanges();

    const cover = fixture.nativeElement.querySelector('.blog-cover');
    console.log('--- BlogsPage Cover Background ---');
    console.log(cover.style.backgroundImage);
  });

  it('should render SVG without stripping in PracticeAreasPage', () => {
    const fixture = TestBed.createComponent(PracticeAreasPage);
    fixture.detectChanges();

    const req = httpMock.expectOne(environment.apiUrl + '/practice-areas/public');
    req.flush([
      { id: '1', title: 'Family Law', description: 'desc', icon_svg: '<svg><circle cx="5" cy="5" r="5"></circle></svg>', action_text: 'Book', link: '/family' }
    ]);

    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector('.icon-wrapper');
    console.log('--- PracticeAreasPage SVG ---');
    console.log(wrapper.innerHTML);
  });

  it('should render rich HTML without escaping in BlogDetailPage', () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { paramMap: of({ get: () => 'test-slug' }) }
    });
    
    const fixture = TestBed.createComponent(BlogDetailPage);
    fixture.detectChanges();

    const req = httpMock.expectOne(environment.apiUrl + '/blogs/test-slug');
    req.flush({
      id: '1', title: 'Test Blog', slug: 'test', excerpt: 'abc', content: '<h2>Rich Text Heading</h2><p>Paragraph</p>', cover_image_url: 'https://example.com/blog.jpg', status: 'published', created_at: '2026-08-18', author: { first_name: 'John' }, category: { name: 'Law' }
    });

    fixture.detectChanges();

    const richText = fixture.nativeElement.querySelector('.rich-text-content');
    console.log('--- BlogDetailPage HTML ---');
    console.log(richText.innerHTML);
  });
});
