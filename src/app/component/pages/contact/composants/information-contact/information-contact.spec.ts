import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformationContact } from './information-contact';

describe('InformationContact', () => {
  let component: InformationContact;
  let fixture: ComponentFixture<InformationContact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InformationContact],
    }).compileComponents();

    fixture = TestBed.createComponent(InformationContact);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
