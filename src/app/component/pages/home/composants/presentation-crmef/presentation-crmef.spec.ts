import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentationCRMEF } from './presentation-crmef';

describe('PresentationCRMEF', () => {
  let component: PresentationCRMEF;
  let fixture: ComponentFixture<PresentationCRMEF>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresentationCRMEF],
    }).compileComponents();

    fixture = TestBed.createComponent(PresentationCRMEF);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
