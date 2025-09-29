import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Playout } from './playout';

describe('Playout', () => {
  let component: Playout;
  let fixture: ComponentFixture<Playout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Playout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Playout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
