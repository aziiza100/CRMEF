import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Supports } from './supports';

describe('Supports', () => {
  let component: Supports;
  let fixture: ComponentFixture<Supports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Supports],
    }).compileComponents();

    fixture = TestBed.createComponent(Supports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
