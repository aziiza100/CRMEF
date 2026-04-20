import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BanniereDynamique } from './banniere-dynamique';

describe('BanniereDynamique', () => {
  let component: BanniereDynamique;
  let fixture: ComponentFixture<BanniereDynamique>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BanniereDynamique],
    }).compileComponents();

    fixture = TestBed.createComponent(BanniereDynamique);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
