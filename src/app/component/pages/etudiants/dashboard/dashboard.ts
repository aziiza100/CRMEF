import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-etudiant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class EtudiantDashboardComponent {
  
  // Données factices pour le tableau de bord
  prochainCours = {
    matiere: 'Didactique des SVT',
    salle: 'Salle 4',
    heure: '10:15'
  };

  derniereNote = {
    matiere: 'TICE',
    note: 17.5,
    date: 'Aujourd\'hui'
  };

  nouveauxSupports = 3;

  coursDuJour = [
    { heure: '08:00 - 10:00', matiere: 'Législation Scolaire', salle: 'Amphi B', type: 'cours' },
    { heure: '10:15 - 12:15', matiere: 'Didactique des SVT', salle: 'Salle 4', type: 'td' }
  ];

  derniersCoursElearning = [
    { titre: 'Introduction au TICE', format: 'pdf', professeur: 'Pr. Benjelloun', date: 'Il y a 2h' },
    { titre: 'Chapitre 2 : La Cellule', format: 'doc', professeur: 'Pr. Alaoui', date: 'Hier' }
  ];

  messages = [
    { titre: 'Rappel : Dépôt du rapport de stage', date: '12 Nov 2023', urgent: true },
    { titre: 'Changement de salle pour le cours de demain', date: '11 Nov 2023', urgent: false }
  ];

}
