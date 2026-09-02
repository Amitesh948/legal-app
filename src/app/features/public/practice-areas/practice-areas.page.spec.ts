import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PracticeAreasPage } from './practice-areas.page';

describe('PracticeAreasPage', () => {
  let component: PracticeAreasPage;
  let fixture: ComponentFixture<PracticeAreasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PracticeAreasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
