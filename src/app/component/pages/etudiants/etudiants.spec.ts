import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EtudiantsComponent } from './etudiants';
import { ApiService } from '../../../core/services/api.service';
import { of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

describe('EtudiantsComponent', () => {
  let component: EtudiantsComponent;
  let fixture: ComponentFixture<EtudiantsComponent>;
  let apiServiceMock: any;

  beforeEach(async () => {
    apiServiceMock = {
      logout: () => of({})
    };

    await TestBed.configureTestingModule({
      imports: [
        EtudiantsComponent,
        RouterModule.forRoot([]),
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EtudiantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
