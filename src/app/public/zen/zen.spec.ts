import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Zen } from './zen';

describe('Zen', () => {
  let component: Zen;
  let fixture: ComponentFixture<Zen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Zen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Zen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});