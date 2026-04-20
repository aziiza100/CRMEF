import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionClasses } from './gestion-classes';

describe('GestionClasses', () => {
  let component: GestionClasses;
  let fixture: ComponentFixture<GestionClasses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionClasses],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionClasses);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
