import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../../../core/services/api.service';

interface Seance {
  id: number;
  heureDebut: string;
  heureFin: string;
  matiere: string; // module name
  moduleId?: number;
  professeur: string;
  salle: string;
}

interface JourEmploi {
  id: string;
  nomKey: string; // nom affiché du jour
  seances: Seance[];
}

@Component({
  selector: 'app-enseignant-emploi',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './emploi.html',
  styleUrls: ['./emploi.css']
})
export class EnseignantEmploiComponent {
  
  classes: string[] = [];
  selectedClass = '';

  jours: JourEmploi[] = [
    { id: 'lundi', nomKey: 'Lundi', seances: [] },
    { id: 'mardi', nomKey: 'Mardi', seances: [] },
    { id: 'mercredi', nomKey: 'Mercredi', seances: [] },
    { id: 'jeudi', nomKey: 'Jeudi', seances: [] },
    { id: 'vendredi', nomKey: 'Vendredi', seances: [] },
    { id: 'samedi', nomKey: 'Samedi', seances: [] }
  ];

  jourActif: JourEmploi = this.jours[0];

  showModal = false;
  editingId: number | null = null;
  toastMessage = '';
  showToast = false;
  errorMessage = '';

  newSeance: Omit<Seance, 'id'> & { moduleId?: number } = {
    heureDebut: '08:00',
    heureFin: '10:00',
    matiere: '',
    moduleId: undefined,
    professeur: '',
    salle: ''
  };

  modulesForClass: Array<{ id: number; nom: string }> = [];
  currentTeacherName = '';

  constructor(private api: ApiService) {
    // 1. Njibo ghir l-classes li 3nd had l-enseignant
    this.api.getEnseignantClasses().subscribe({
      next: (classes: any[]) => {
        this.classes = classes.map((c: any) => c.nom);
        this.selectedClass = this.classes[0] ?? '';
        if (this.selectedClass) {
          this.loadEmploiForSelectedClass();
        }
      },
      error: () => {
        this.classes = [];
        this.triggerToast('Impossible de charger vos classes.');
      }
    });

    // 2. Njibo smit l-enseignant connect é automatic b getMe() bsa7 may7tajich t-sélectionniha mn select box
    this.api.getMe().subscribe({
      next: (res: any) => {
        const userData = res?.user || res;
        this.currentTeacherName = userData ? `${userData.nom} ${userData.prenom ?? ''}`.trim() : 'Enseignant';
      }
    });
  }

  selectJour(jour: JourEmploi) {
    this.jourActif = jour;
  }

  onClassChange() {
    this.loadEmploiForSelectedClass();
  }

  loadEmploiForSelectedClass() {
    // Njibo l-classes dyalo ou n-choufo l-emploi m3a l-route sshi7a dyal l-enseignant
    this.api.getEnseignantClasses().subscribe({ 
      next: (classes: any[]) => {
        const cls = classes.find((c: any) => c.nom === this.selectedClass);
        if (!cls) return;

        // Khedmana b l-route sshi7a dyal l-enseignant bach t7yyd error 403
        this.api.getEnseignantEmploiForClass(cls.id).subscribe({ 
          next: (res: any) => {
            // clear days
            this.jours.forEach(d => d.seances = []);
            
            (res.seances || []).forEach((s: any) => {
              const jour = this.jours.find(d => d.id === (s.jour || '').toLowerCase()) || this.jours[0];
              jour.seances.push({ 
                id: s.id, 
                heureDebut: this.formatTime(s.heureDebut), 
                heureFin: this.formatTime(s.heureFin), 
                matiere: s.matiere || (s.module ? s.module.nom : ''), 
                moduleId: s.module_id ?? null, 
                professeur: s.professeur || this.currentTeacherName, 
                salle: s.salle || '' 
              });
            });

            this.jours.forEach(d => d.seances.sort((a, b) => a.heureDebut.localeCompare(b.heureDebut)));
            this.jourActif = this.jours.find(d => d.id === this.jourActif.id) || this.jours[0];
          }, 
          error: (err: any) => this.triggerToast(err?.message || 'Impossible de charger l\'emploi du temps') 
        });
      }
    });
  }

  private formatTime(t: string | null | undefined): string {
    if (!t) return '';
    const m = String(t).trim();
    const hhmm = m.match(/^(\d{1,2}:\d{2})/)?.[1];
    if (hhmm) return hhmm;
    return m;
  }

  openModal(seance?: Seance) {
    if (seance) {
      this.editingId = seance.id;
      this.newSeance = { 
        heureDebut: seance.heureDebut,
        heureFin: seance.heureFin,
        matiere: seance.matiere,
        moduleId: seance.moduleId,
        professeur: this.currentTeacherName, // Dima smit l-prof li connect é
        salle: seance.salle
      };
    } else {
      this.editingId = null;
      this.newSeance = { 
        heureDebut: '08:00', 
        heureFin: '10:00', 
        matiere: '', 
        moduleId: undefined, 
        professeur: this.currentTeacherName, 
        salle: '' 
      };
    }

    this.api.getEnseignantClasses().subscribe({ 
      next: (classes: any[]) => {
        const cls = classes.find((c: any) => c.nom === this.selectedClass);
        if (!cls) return;
        
        this.api.getEnseignantClass(cls.id).subscribe({ 
          next: (res: any) => {
            this.modulesForClass = (res.modules || []).map((m: any) => ({ id: m.id, nom: m.nom }));
          },
          error: () => {
            // Fallback sghir ila l-details m7mya
            this.modulesForClass = [];
          }
        });
      }
    });
    this.showModal = true;
  }

  onModuleChange() {
    const modId = Number(this.newSeance.moduleId);
    const mod = this.modulesForClass.find(m => Number(m.id) === modId);
    if (mod) {
      this.newSeance.matiere = mod.nom;
    }
    this.newSeance.professeur = this.currentTeacherName;
  }

  closeModal() {
    this.showModal = false;
  }

  

  triggerToast(msg: string) {
    this.toastMessage = msg;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}