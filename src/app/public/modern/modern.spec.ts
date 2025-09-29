import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Modern } from './modern';

describe('Modern', () => {
  let component: Modern;
  let fixture: ComponentFixture<Modern>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Modern]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Modern);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});