import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

interface Seance {
  id: number;
  heureDebut: string;
  heureFin: string;
  matiere: string;
  professeur: string;
  salle: string;
  type: 'cours' | 'td' | 'tp';
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
  
  classes = ['SVT-4', 'Math-1', 'Info-2'];
  selectedClass = 'SVT-4';

  jours: JourEmploi[] = [
    {
      id: 'lundi',
      nomKey: 'Lundi',
      seances: [
        { id: 1, heureDebut: '08:00', heureFin: '10:00', matiere: 'Didactique des SVT', professeur: 'Pr. Alaoui', salle: 'Salle 4', type: 'cours' },
        { id: 2, heureDebut: '10:15', heureFin: '12:15', matiere: 'Didactique des SVT', professeur: 'Pr. Alaoui', salle: 'Labo 1', type: 'tp' },
        { id: 3, heureDebut: '14:00', heureFin: '16:00', matiere: 'Sciences de l\'Éducation', professeur: 'Pr. Idrissi', salle: 'Amphi A', type: 'cours' }
      ]
    },
    {
      id: 'mardi',
      nomKey: 'Mardi',
      seances: [
        { id: 4, heureDebut: '08:00', heureFin: '12:00', matiere: 'TICE', professeur: 'Pr. Benjelloun', salle: 'Salle Info 2', type: 'tp' }
      ]
    },
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

  newSeance: Omit<Seance, 'id'> = {
    heureDebut: '08:00',
    heureFin: '10:00',
    matiere: '',
    professeur: '',
    salle: '',
    type: 'cours'
  };

  professeurs = ['Pr. Alaoui', 'Pr. Idrissi', 'Pr. Benjelloun', 'Pr. Cherkaoui'];

  selectJour(jour: JourEmploi) {
    this.jourActif = jour;
  }

  onClassChange() {
    // Dans une vraie app, cela chargerait l'emploi du temps de la classe sélectionnée depuis l'API
    this.triggerToast(`Emploi du temps de la classe ${this.selectedClass} chargé.`);
  }

  openModal(seance?: Seance) {
    if (seance) {
      this.editingId = seance.id;
      this.newSeance = { 
        heureDebut: seance.heureDebut,
        heureFin: seance.heureFin,
        matiere: seance.matiere,
        professeur: seance.professeur,
        salle: seance.salle,
        type: seance.type
      };
    } else {
      this.editingId = null;
      this.newSeance = { heureDebut: '08:00', heureFin: '10:00', matiere: '', professeur: '', salle: '', type: 'cours' };
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveSeance() {
    if (this.editingId) {
      const idx = this.jourActif.seances.findIndex(s => s.id === this.editingId);
      this.jourActif.seances[idx] = { id: this.editingId, ...this.newSeance };
    } else {
      this.jourActif.seances.push({ id: Date.now(), ...this.newSeance });
      // Tri par heure de début
      this.jourActif.seances.sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));
    }
    
    this.closeModal();
    this.triggerToast(this.editingId ? 'Séance mise à jour.' : 'Séance ajoutée.');
  }

  deleteSeance(id: number) {
    if (confirm("Supprimer cette séance ?")) {
      this.jourActif.seances = this.jourActif.seances.filter(s => s.id !== id);
      this.triggerToast('Séance supprimée.');
    }
  }

  triggerToast(msg: string) {
    this.toastMessage = msg;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
