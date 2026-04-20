import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Presentation } from './presentation';

describe('Presentation', () => {
  let component: Presentation;
  let fixture: ComponentFixture<Presentation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Presentation],
    }).compileComponents();

    fixture = TestBed.createComponent(Presentation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
