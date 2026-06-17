import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnseignantDashboard } from './dashboard';
import { ApiService } from '../../../../core/services/api.service';
import { of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

describe('EnseignantDashboard', () => {
  let component: EnseignantDashboard;
  let fixture: ComponentFixture<EnseignantDashboard>;
  let apiServiceMock: any;

  beforeEach(async () => {
    // Create mock ApiService returning mock dashboard data
    apiServiceMock = {
      getEnseignantDashbord: () => of({
        classes_count: 3,
        modules_count: 5,
        heures_count: 24,
        next_class: {
          heure_debut: '14:30',
          heure_fin: '16:30',
          module_nom: 'Algorithmique',
          salle: 'Salle A1',
          classe_nom: 'AP-1'
        }
      })
    };

    await TestBed.configureTestingModule({
      imports: [
        EnseignantDashboard,
        RouterModule.forRoot([]),
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EnseignantDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard stats successfully', () => {
    expect(component.classesCount).toBe(3);
    expect(component.coursesCount).toBe(5);
    expect(component.totalHours).toBe(24);
  });

  it('should load next class planning successfully', () => {
    expect(component.nextClass).not.toBeNull();
    expect(component.nextClass.subject).toBe('Algorithmique');
    expect(component.nextClass.location).toBe('Salle A1');
    expect(component.nextClass.classe).toBe('AP-1');
  });

  it('should render the statistics in the DOM', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    // Check if coursesCount (5) is rendered
    expect(compiled.querySelector('.overview-cards')?.textContent).toContain('5');
    // Check if next class subject is rendered
    expect(compiled.querySelector('.class-subject')?.textContent).toContain('Algorithmique');
  });
});
