import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConditionsAcces } from './conditions-acces';

describe('ConditionsAcces', () => {
  let component: ConditionsAcces;
  let fixture: ComponentFixture<ConditionsAcces>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConditionsAcces],
    }).compileComponents();

    fixture = TestBed.createComponent(ConditionsAcces);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
