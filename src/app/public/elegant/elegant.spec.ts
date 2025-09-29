import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Elegant } from './elegant';

describe('Elegant', () => {
  let component: Elegant;
  let fixture: ComponentFixture<Elegant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Elegant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Elegant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});