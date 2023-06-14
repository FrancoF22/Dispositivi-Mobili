import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LessonsPage } from './lessons.page';

describe('LessonsPage', () => {
  let component: LessonsPage;
  let fixture: ComponentFixture<LessonsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LessonsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
