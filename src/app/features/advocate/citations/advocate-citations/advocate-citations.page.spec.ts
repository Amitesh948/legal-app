import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdvocateCitationsPage } from './advocate-citations.page';

describe('AdvocateCitationsPage', () => {
  let component: AdvocateCitationsPage;
  let fixture: ComponentFixture<AdvocateCitationsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvocateCitationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
