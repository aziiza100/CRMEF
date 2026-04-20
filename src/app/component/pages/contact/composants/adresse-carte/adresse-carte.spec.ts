import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdresseCarte } from './adresse-carte';

describe('AdresseCarte', () => {
  let component: AdresseCarte;
  let fixture: ComponentFixture<AdresseCarte>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdresseCarte],
    }).compileComponents();

    fixture = TestBed.createComponent(AdresseCarte);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
