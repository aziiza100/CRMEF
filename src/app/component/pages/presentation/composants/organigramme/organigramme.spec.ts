import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Organigramme } from './organigramme';

describe('Organigramme', () => {
  let component: Organigramme;
  let fixture: ComponentFixture<Organigramme>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Organigramme],
    }).compileComponents();

    fixture = TestBed.createComponent(Organigramme);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
