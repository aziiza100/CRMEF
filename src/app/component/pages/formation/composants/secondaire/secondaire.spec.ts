import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Secondaire } from './secondaire';

describe('Secondaire', () => {
  let component: Secondaire;
  let fixture: ComponentFixture<Secondaire>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Secondaire],
    }).compileComponents();

    fixture = TestBed.createComponent(Secondaire);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
