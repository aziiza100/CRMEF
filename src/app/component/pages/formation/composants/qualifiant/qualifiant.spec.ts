import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Qualifiant } from './qualifiant';

describe('Qualifiant', () => {
  let component: Qualifiant;
  let fixture: ComponentFixture<Qualifiant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Qualifiant],
    }).compileComponents();

    fixture = TestBed.createComponent(Qualifiant);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
