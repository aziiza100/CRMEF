import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-enseignants',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './enseignants.html',
  styleUrls: ['./enseignants.css']
})
export class Enseignants {
  activeSection: 'profil' | 'classes' = 'profil';

  constructor(private translate: TranslateService, public router: Router, private api: ApiService) {
    const savedLang = localStorage.getItem('lang') || 'fr';
    this.currentLang = savedLang;
    this.translate.use(this.currentLang);
    document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
  }
  
  logout() {
    this.api.logout().subscribe({
      next: () => {
        localStorage.removeItem('crmef_admin_token');
        this.router.navigate(['/login']);
      },
      error: () => {
        localStorage.removeItem('crmef_admin_token');
        this.router.navigate(['/login']);
      }
    });
  }

  changeLang(lang: string) {
    this.translate.use(lang);
    this.currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  formations: Formation[] = [
    {
      type: 'Primaire',
      site: 'Site Hassan II',
      modules: [
        { id: 'fr', name: 'Français' },
        { id: 'math', name: 'Mathématiques' },
        { id: 'science', name: 'Sciences' },
      ],
    },
    {
      type: 'Secondaire',
      site: 'Site Al Jabr',
      modules: [
        { id: 'physique', name: 'Physique' },
        { id: 'algo', name: 'Algorithmique' },
        { id: 'info', name: 'Informatique' },
      ],
    },
    {
      type: 'Qualifiante',
      site: 'Site Abdelkrim',
      modules: [
        { id: 'gestion', name: 'Gestion' },
        { id: 'compta', name: 'Comptabilité' },
        { id: 'marketing', name: 'Marketing' },
      ],
    },
  ];

  classes: Classe[] = [
    {
      id: 1,
      name: 'Classe 1A',
      formationType: 'Primaire',
      site: 'Site Hassan II',
      moduleId: 'math',
      moduleName: 'Mathématiques',
      students: [
        { id: 1, name: 'Youssef El Amrani', email: 'youssef.elamrani@gmail.com' },
        { id: 2, name: 'Sara Benali', email: 'sara.benali@gmail.com' },
        { id: 3, name: 'Hamid Mouhib', email: 'hamid.mouhib@gmail.com' },
      ],
      resources: [
        { id: 1, title: 'Cours Nombres et opérations', file: 'cours-math-primaire.pdf' },
        { id: 2, title: 'Exercices de géométrie', file: 'exercices-geo.pdf' },
      ],
      notes: [
        { studentId: 1, value: 15 },
        { studentId: 2, value: 17 },
        { studentId: 3, value: 13 },
      ],
    },
    {
      id: 2,
      name: 'Classe 2B',
      formationType: 'Qualifiante',
      site: 'Site Abdelkrim',
      moduleId: 'gestion',
      moduleName: 'Gestion',
      students: [
        { id: 4, name: 'Imane Riahi', email: 'imane.riahi@gmail.com' },
        { id: 5, name: 'Khalid Ziani', email: 'khalid.ziani@gmail.com' },
      ],
      resources: [
        { id: 1, title: 'Introduction à la gestion', file: 'gestion-intro.pdf' },
      ],
      notes: [
        { studentId: 4, value: 12 },
        { studentId: 5, value: 14 },
      ],
    },
  ];

  selectedClassId = 1;

  newResourceTitle = '';
  newResourceFile = '';

  get selectedClass(): Classe | undefined {
    return this.classes.find(classe => classe.id === this.selectedClassId);
  }

  get selectedFormation(): Formation | undefined {
    return this.formations.find(f => f.type === this.selectedClass?.formationType);
  }

  get averageNote(): number {
    const classe = this.selectedClass;
    if (!classe || classe.notes.length === 0) return 0;
    return Math.round(classe.notes.reduce((sum, note) => sum + note.value, 0) / classe.notes.length);
  }

  selectClass(id: number) {
    this.selectedClassId = id;
    this.activeSection = 'classes';
  }

  updateClassModule(moduleId: string) {
    const classe = this.selectedClass;
    const formation = this.selectedFormation;
    const module = formation?.modules.find(m => m.id === moduleId);
    if (classe && module) {
      classe.moduleId = module.id;
      classe.moduleName = module.name;
    }
  }

  addResource() {
    const classe = this.selectedClass;
    if (!classe || !this.newResourceTitle.trim() || !this.newResourceFile.trim()) {
      return;
    }
    const nextId = Math.max(0, ...classe.resources.map(resource => resource.id)) + 1;
    classe.resources.push({ id: nextId, title: this.newResourceTitle.trim(), file: this.newResourceFile.trim() });
    this.newResourceTitle = '';
    this.newResourceFile = '';
  }

  updateNote(studentId: number, value: string) {
    const noteValue = Number(value);
    const classe = this.selectedClass;
    if (!classe || Number.isNaN(noteValue) || noteValue < 0 || noteValue > 20) {
      return;
    }
    const note = classe.notes.find(item => item.studentId === studentId);
    if (note) {
      note.value = noteValue;
    }
  }

  trackByClass(index: number, classe: Classe): number {
    return classe.id;
  }
}
 
