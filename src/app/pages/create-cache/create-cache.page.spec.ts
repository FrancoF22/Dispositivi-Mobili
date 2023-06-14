import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateCachePage } from './create-cache.page';

describe('CreateCachePage', () => {
  let component: CreateCachePage;
  let fixture: ComponentFixture<CreateCachePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CreateCachePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
