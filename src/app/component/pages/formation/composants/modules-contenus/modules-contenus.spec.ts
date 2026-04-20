import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModulesContenus } from './modules-contenus';

describe('ModulesContenus', () => {
  let component: ModulesContenus;
  let fixture: ComponentFixture<ModulesContenus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModulesContenus],
    }).compileComponents();

    fixture = TestBed.createComponent(ModulesContenus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
