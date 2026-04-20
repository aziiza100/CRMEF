import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageDirecteur } from './message-directeur';

describe('MessageDirecteur', () => {
  let component: MessageDirecteur;
  let fixture: ComponentFixture<MessageDirecteur>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageDirecteur],
    }).compileComponents();

    fixture = TestBed.createComponent(MessageDirecteur);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
