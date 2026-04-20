import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionsObjectifs } from './missions-objectifs';

describe('MissionsObjectifs', () => {
  let component: MissionsObjectifs;
  let fixture: ComponentFixture<MissionsObjectifs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissionsObjectifs],
    }).compileComponents();

    fixture = TestBed.createComponent(MissionsObjectifs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
