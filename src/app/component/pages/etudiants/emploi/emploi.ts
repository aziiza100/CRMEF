import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface Seance {
  heureDebut: string;
  heureFin: string;
  matiere: string;
  professeur: string;
  salle: string;
  type: 'cours' | 'td' | 'tp';
}

interface JourEmploi {
  id: string;
  nomKey: string; // clé de traduction, ex: etudiant.emploi.days.lundi
  seances: Seance[];
}

@Component({
  selector: 'app-etudiant-emploi',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './emploi.html',
  styleUrls: ['./emploi.css']
})
export class EtudiantEmploiComponent {
  
  jours: JourEmploi[] = [
    {
      id: 'lundi',
      nomKey: 'etudiant.emploi.days.lundi',
      seances: [
        { heureDebut: '08:00', heureFin: '10:00', matiere: 'Didactique des SVT', professeur: 'Pr. Alaoui', salle: 'Salle 4', type: 'cours' },
        { heureDebut: '10:15', heureFin: '12:15', matiere: 'Didactique des SVT', professeur: 'Pr. Alaoui', salle: 'Labo 1', type: 'tp' },
        { heureDebut: '14:00', heureFin: '16:00', matiere: 'Sciences de l\'Éducation', professeur: 'Pr. Idrissi', salle: 'Amphi A', type: 'cours' }
      ]
    },
    {
      id: 'mardi',
      nomKey: 'etudiant.emploi.days.mardi',
      seances: [
        { heureDebut: '08:00', heureFin: '12:00', matiere: 'TICE', professeur: 'Pr. Benjelloun', salle: 'Salle Info 2', type: 'tp' },
        { heureDebut: '14:00', heureFin: '18:00', matiere: 'Planification', professeur: 'Pr. Tazi', salle: 'Salle 6', type: 'td' }
      ]
    },
    {
      id: 'mercredi',
      nomKey: 'etudiant.emploi.days.mercredi',
      seances: [
        { heureDebut: '09:00', heureFin: '12:00', matiere: 'Législation Scolaire', professeur: 'Pr. Chraibi', salle: 'Amphi B', type: 'cours' }
      ]
    },
    {
      id: 'jeudi',
      nomKey: 'etudiant.emploi.days.jeudi',
      seances: [
        { heureDebut: '08:00', heureFin: '10:00', matiere: 'Recherche Action', professeur: 'Pr. Amrani', salle: 'Salle 2', type: 'td' },
        { heureDebut: '10:15', heureFin: '12:15', matiere: 'Sciences de l\'Éducation', professeur: 'Pr. Idrissi', salle: 'Amphi A', type: 'cours' }
      ]
    },
    {
      id: 'vendredi',
      nomKey: 'etudiant.emploi.days.vendredi',
      seances: []
    },
    {
      id: 'samedi',
      nomKey: 'etudiant.emploi.days.samedi',
      seances: []
    }
  ];

  jourActif: JourEmploi = this.jours[0];

  selectJour(jour: JourEmploi) {
    this.jourActif = jour;
  }

  downloadPDF() {
    alert("Simulation du téléchargement de l'emploi du temps en PDF.");
  }
}
