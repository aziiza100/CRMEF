import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Emploi } from './emploi';

describe('Emploi', () => {
  let component: Emploi;
  let fixture: ComponentFixture<Emploi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Emploi],
    }).compileComponents();

    fixture = TestBed.createComponent(Emploi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
