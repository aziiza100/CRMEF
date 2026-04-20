import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Enseignants } from './enseignants';

describe('Enseignants', () => {
  let component: Enseignants;
  let fixture: ComponentFixture<Enseignants>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Enseignants],
    }).compileComponents();

    fixture = TestBed.createComponent(Enseignants);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
