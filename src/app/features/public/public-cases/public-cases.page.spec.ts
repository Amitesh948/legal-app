import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicCasesPage } from './public-cases.page';

describe('PublicCasesPage', () => {
  let component: PublicCasesPage;
  let fixture: ComponentFixture<PublicCasesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicCasesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
