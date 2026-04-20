import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaireContacte } from './formulaire-contacte';

describe('FormulaireContacte', () => {
  let component: FormulaireContacte;
  let fixture: ComponentFixture<FormulaireContacte>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormulaireContacte],
    }).compileComponents();

    fixture = TestBed.createComponent(FormulaireContacte);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
