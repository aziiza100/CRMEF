import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pedagogique } from './pedagogique';

describe('Pedagogique', () => {
  let component: Pedagogique;
  let fixture: ComponentFixture<Pedagogique>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pedagogique],
    }).compileComponents();

    fixture = TestBed.createComponent(Pedagogique);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
