import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

interface CoursDoc {
  id: number;
  titre: string;
  description: string;
  specialite: string; // svt, math, pc, didactique
  auteur: string;
  dateAjout: string;
  taille: string;
  format: 'pdf' | 'doc' | 'zip';
}

@Component({
  selector: 'app-enseignant-telecharger-cours',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './telecharger-cours.html',
  styleUrls: ['./telecharger-cours.css']
})
export class TelechargerCoursComponent {
  
  searchTerm: string = '';
  selectedSpecialty: string = 'all';
  showSuccess = false;

  specialties = [
    { value: 'all', labelKey: 'telechargerCours.allSpecialties' },
    { value: 'svt', labelKey: 'telechargerCours.specialties.svt' },
    { value: 'math', labelKey: 'telechargerCours.specialties.math' },
    { value: 'pc', labelKey: 'telechargerCours.specialties.pc' },
    { value: 'didactique', labelKey: 'telechargerCours.specialties.didactique' }
  ];

  coursList: CoursDoc[] = [
    { id: 1, titre: 'Introduction à la Didactique des SVT', description: 'Concepts fondamentaux et méthodologies de l\'enseignement des SVT au cycle qualifiant.', specialite: 'svt', auteur: 'Pr. Alaoui', dateAjout: '12 Sept 2023', taille: '2.4 MB', format: 'pdf' },
    { id: 2, titre: 'Planification Pédagogique', description: 'Guide pratique pour la préparation des fiches pédagogiques et la gestion du temps scolaire.', specialite: 'didactique', auteur: 'Pr. Benjelloun', dateAjout: '05 Oct 2023', taille: '1.1 MB', format: 'doc' },
    { id: 3, titre: 'Exercices d\'Algèbre Linéaire', description: 'Série d\'exercices corrigés pour la 1ère année Bac.', specialite: 'math', auteur: 'Pr. Idrissi', dateAjout: '22 Nov 2023', taille: '3.8 MB', format: 'pdf' },
    { id: 4, titre: 'Mécanique Newtonienne', description: 'Support de cours complet avec schémas et démonstrations des lois de Newton.', specialite: 'pc', auteur: 'Pr. Tazi', dateAjout: '14 Dec 2023', taille: '5.2 MB', format: 'pdf' },
    { id: 5, titre: 'Ateliers Pratiques SVT', description: 'Fiches techniques pour les expériences en laboratoire.', specialite: 'svt', auteur: 'Pr. Alaoui', dateAjout: '10 Jan 2024', taille: '12 MB', format: 'zip' }
  ];

  get filteredCours(): CoursDoc[] {
    return this.coursList.filter(cours => {
      const matchSearch = cours.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                          cours.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchSpecialty = this.selectedSpecialty === 'all' || cours.specialite === this.selectedSpecialty;
      return matchSearch && matchSpecialty;
    });
  }

  getFormatIcon(format: string): string {
    switch(format) {
      case 'pdf': return 'bi-file-earmark-pdf-fill text-danger';
      case 'doc': return 'bi-file-earmark-word-fill text-primary';
      case 'zip': return 'bi-file-earmark-zip-fill text-warning';
      default: return 'bi-file-earmark-text-fill text-secondary';
    }
  }

  telecharger(cours: CoursDoc) {
    // Simulation du téléchargement
    console.log('Téléchargement de:', cours.titre);
    
    this.showSuccess = true;
    setTimeout(() => {
      this.showSuccess = false;
    }, 3000);
  }
}
