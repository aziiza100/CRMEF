import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Etudiants } from './etudiants';

describe('Etudiants', () => {
  let component: Etudiants;
  let fixture: ComponentFixture<Etudiants>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Etudiants],
    }).compileComponents();

    fixture = TestBed.createComponent(Etudiants);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
