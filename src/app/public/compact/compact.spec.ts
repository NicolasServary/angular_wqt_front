import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Compact } from './compact';

describe('Compact', () => {
  let component: Compact;
  let fixture: ComponentFixture<Compact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Compact]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Compact);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});