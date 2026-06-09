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
  selector: 'app-admin-emploi',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './emploi.html',
  styleUrls: ['./emploi.css']
})
export class AdminEmploiComponent {
  
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

  newSeance: Omit<Seance, 'id'> & { moduleId?: number } = {
    heureDebut: '08:00',
    heureFin: '10:00',
    matiere: '',
    moduleId: undefined,
    professeur: '',
    salle: ''
  };

  modulesForClass: Array<{ id: number; nom: string; pivot?: { id_enseignant?: number } }> = [];

  professeurs: string[] = [];
  enseignantsMap: { [id: number]: string } = {};

  constructor(private api: ApiService) {
    // load classes from API
    this.api.getAdminClasses().subscribe({
      next: (classes: any[]) => {
        // map to display names
        this.classes = classes.map((c: any) => c.nom);
        this.selectedClass = this.classes[0] ?? '';
        if (this.selectedClass) {
          this.loadEmploiForSelectedClass();
        }
      },
      error: () => {
        // fallback to defaults
        this.classes = ['SVT-4', 'Math-1', 'Info-2'];
        this.selectedClass = this.classes[0];
      }
    });
    // load enseignants to populate professeurs list
    this.api.getAdminEnseignants().subscribe({ next: (ens: any[]) => { 
      this.professeurs = ens.map((e:any) => (e.enseignant?.id_enseignant ? (e.user?.nom ? (e.user.nom + ' ' + e.user.prenom) : (e.nom + ' ' + e.prenom)) : e.nom + ' ' + e.prenom));
      // build id->name map
      ens.forEach((e:any) => {
        const id = e.enseignant?.id_enseignant ?? null;
        const name = e.user?.nom ? (e.user.nom + ' ' + (e.user.prenom ?? '')) : ((e.nom ?? '') + ' ' + (e.prenom ?? ''));
        if (id) this.enseignantsMap[id] = name.trim();
      });
    } });
  }

  selectJour(jour: JourEmploi) {
    this.jourActif = jour;
  }

  onClassChange() {
    this.loadEmploiForSelectedClass();
  }

  loadEmploiForSelectedClass() {
    // find class id by name
    this.api.getAdminClasses().subscribe({ next: (classes: any[]) => {
      const cls = classes.find((c:any) => c.nom === this.selectedClass);
      if (!cls) return;
      this.api.getEmploiForClass(cls.id).subscribe({ next: (res: any) => {
        // clear days
        this.jours.forEach(d => d.seances = []);
        (res.seances || []).forEach((s:any) => {
          const jour = this.jours.find(d => d.id === (s.jour || '').toLowerCase()) || this.jours[0];
          jour.seances.push({ id: s.id, heureDebut: this.formatTime(s.heureDebut), heureFin: this.formatTime(s.heureFin), matiere: s.matiere || '', moduleId: s.module_id ?? null, professeur: s.professeur || '', salle: s.salle || '' });
        });
        this.jours.forEach(d => d.seances.sort((a,b) => a.heureDebut.localeCompare(b.heureDebut)));
        this.jourActif = this.jours[0];
      }, error: (err: any) => this.triggerToast(err?.message || 'Impossible de charger l\'emploi du temps') });
    }});
  }

  private formatTime(t: string | null | undefined): string {
    if (!t) return '';
    // expected formats: '09:00:00.0000000' or '09:00:00' or '09:00'
    const m = String(t).trim();
    // take first 5 characters if looks like HH:MM
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
        professeur: seance.professeur,
        salle: seance.salle
      };
    } else {
      this.editingId = null;
      this.newSeance = { heureDebut: '08:00', heureFin: '10:00', matiere: '', moduleId: undefined, professeur: '', salle: '' };
    }
    // load modules for selected class
    this.api.getAdminClasses().subscribe({ next: (classes: any[]) => {
      const cls = classes.find((c:any) => c.nom === this.selectedClass);
      if (!cls) return;
      this.api.getAdminClass(cls.id).subscribe({ next: (res: any) => {
        this.modulesForClass = (res.modules || []).map((m:any) => ({ id: m.id, nom: m.nom, pivot: m.pivot || {} }));
        // if editing and moduleId set, find professor from pivot
        if (this.newSeance.moduleId) {
          const mod = this.modulesForClass.find(m => m.id === this.newSeance.moduleId);
          if (mod && mod.pivot && mod.pivot.id_enseignant) {
            this.newSeance.professeur = this.enseignantsMap[mod.pivot.id_enseignant] ?? this.newSeance.professeur;
          }
        }
      }});
    }});
    this.showModal = true;
  }

  onModuleChange() {
    const modId = Number(this.newSeance.moduleId);
    const mod = this.modulesForClass.find(m => Number(m.id) === modId);
    if (mod && mod.pivot && mod.pivot.id_enseignant) {
      this.newSeance.professeur = this.enseignantsMap[mod.pivot.id_enseignant] ?? this.newSeance.professeur;
    } else {
      this.newSeance.professeur = '';
    }
  }

  closeModal() {
    this.showModal = false;
  }

  saveSeance() {
    // find class id
    this.api.getAdminClasses().subscribe({ next: (classes: any[]) => {
      const cls = classes.find((c:any) => c.nom === this.selectedClass);
      if (!cls) return this.triggerToast('Classe introuvable');

      const payload: any = {
        jour: this.jourActif.id,
        heureDebut: this.newSeance.heureDebut,
        heureFin: this.newSeance.heureFin,
        module_id: this.newSeance.moduleId ?? null,
        salle: this.newSeance.salle
      };

      if (this.editingId) {
        this.api.updateSeance(this.editingId, payload).subscribe({ next: (res: any) => {
          this.loadEmploiForSelectedClass();
          this.closeModal();
          this.triggerToast('Séance mise à jour.');
        }, error: (err: any) => this.triggerToast(err?.error?.message || err?.message || 'Impossible de mettre à jour la séance') });
      } else {
        this.api.createSeance(cls.id, payload).subscribe({ next: (res: any) => {
          this.loadEmploiForSelectedClass();
          this.closeModal();
          this.triggerToast('Séance ajoutée.');
        }, error: (err: any) => this.triggerToast(err?.error?.message || err?.message || 'Impossible d\'ajouter la séance') });
      }
    }});
  }

  deleteSeance(id: number) {
    if (!confirm("Supprimer cette séance ?")) return;
    this.api.deleteSeance(id).subscribe({ next: () => {
      this.loadEmploiForSelectedClass();
      this.triggerToast('Séance supprimée.');
    }, error: (err) => this.triggerToast(err?.message || 'Impossible de supprimer la séance') });
  }

  triggerToast(msg: string) {
    this.toastMessage = msg;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
