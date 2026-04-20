import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagerieInterne } from './messagerie-interne';

describe('MessagerieInterne', () => {
  let component: MessagerieInterne;
  let fixture: ComponentFixture<MessagerieInterne>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessagerieInterne],
    }).compileComponents();

    fixture = TestBed.createComponent(MessagerieInterne);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
