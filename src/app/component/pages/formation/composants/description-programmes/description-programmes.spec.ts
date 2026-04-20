import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescriptionProgrammes } from './description-programmes';

describe('DescriptionProgrammes', () => {
  let component: DescriptionProgrammes;
  let fixture: ComponentFixture<DescriptionProgrammes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescriptionProgrammes],
    }).compileComponents();

    fixture = TestBed.createComponent(DescriptionProgrammes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
