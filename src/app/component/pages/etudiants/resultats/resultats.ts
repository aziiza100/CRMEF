import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface ResultatModule {
  matiere: string;
  noteActivite: number;
  noteExam: number;
  moyenne: number;
  isValide: boolean;
}

@Component({
  selector: 'app-etudiant-resultats',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './resultats.html',
  styleUrls: ['./resultats.css']
})
export class EtudiantResultatsComponent {
  
  // Statistiques globales
  moyenneGenerale = 14.25;
  modulesValides = 5;
  totalModules = 6;
  rangClasse = '4ème';

  // Détail des notes par module
  resultats: ResultatModule[] = [
    { matiere: 'Didactique des SVT', noteActivite: 15.5, noteExam: 14.0, moyenne: 14.75, isValide: true },
    { matiere: 'Sciences de l\'Éducation', noteActivite: 13.0, noteExam: 16.5, moyenne: 14.75, isValide: true },
    { matiere: 'Législation Scolaire', noteActivite: 16.0, noteExam: 15.0, moyenne: 15.50, isValide: true },
    { matiere: 'TICE', noteActivite: 18.0, noteExam: 17.5, moyenne: 17.75, isValide: true },
    { matiere: 'Planification', noteActivite: 12.0, noteExam: 14.0, moyenne: 13.00, isValide: true },
    { matiere: 'Recherche Action', noteActivite: 11.0, noteExam: 8.5, moyenne: 9.75, isValide: false }
  ];

}
