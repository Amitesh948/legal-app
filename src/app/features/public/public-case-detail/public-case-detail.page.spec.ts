import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicCaseDetailPage } from './public-case-detail.page';

describe('PublicCaseDetailPage', () => {
  let component: PublicCaseDetailPage;
  let fixture: ComponentFixture<PublicCaseDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicCaseDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
