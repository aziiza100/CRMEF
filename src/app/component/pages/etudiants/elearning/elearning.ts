import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

interface ElearningDoc {
  id: number;
  titre: string;
  description: string;
  matiere: string; // svt, math, pc, etc.
  professeur: string;
  dateMiseEnLigne: string;
  format: 'pdf' | 'video' | 'doc';
  isNew: boolean;
}

@Component({
  selector: 'app-etudiant-elearning',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './elearning.html',
  styleUrls: ['./elearning.css']
})
export class ElearningComponent {
  
  searchTerm: string = '';
  selectedMatiere: string = 'all';
  showSuccess = false;

  matieres = [
    { value: 'all', labelKey: 'etudiant.elearning.allSubjects' },
    { value: 'svt', label: 'SVT' },
    { value: 'math', label: 'Mathématiques' },
    { value: 'pc', label: 'Physique-Chimie' },
    { value: 'info', label: 'Informatique' }
  ];

  // Mock data of courses available to the student
  coursList: ElearningDoc[] = [
    { id: 1, titre: 'La Cellule Eucaryote', description: 'Chapitre 1 : Structure et ultrastructure de la cellule animale et végétale.', matiere: 'svt', professeur: 'Pr. Alaoui', dateMiseEnLigne: 'Hier', format: 'pdf', isNew: true },
    { id: 2, titre: 'Fonctions Exponentielles', description: 'Série d\'exercices préparatoires avec corrections détaillées.', matiere: 'math', professeur: 'Pr. Idrissi', dateMiseEnLigne: 'Il y a 2 jours', format: 'doc', isNew: true },
    { id: 3, titre: 'Atelier de Programmation Python', description: 'Bases de l\'algorithmique et premiers scripts.', matiere: 'info', professeur: 'Pr. Tazi', dateMiseEnLigne: 'La semaine dernière', format: 'video', isNew: false },
    { id: 4, titre: 'Lois de Newton', description: 'Résumé de cours et schémas du bilan des forces.', matiere: 'pc', professeur: 'Pr. Benjelloun', dateMiseEnLigne: 'Le mois dernier', format: 'pdf', isNew: false }
  ];

  get filteredCours(): ElearningDoc[] {
    return this.coursList.filter(cours => {
      const matchSearch = cours.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                          cours.professeur.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchMatiere = this.selectedMatiere === 'all' || cours.matiere === this.selectedMatiere;
      return matchSearch && matchMatiere;
    });
  }

  getFormatIcon(format: string): string {
    switch(format) {
      case 'pdf': return 'bi-file-earmark-pdf-fill text-danger';
      case 'doc': return 'bi-file-earmark-word-fill text-primary';
      case 'video': return 'bi-play-circle-fill text-indigo';
      default: return 'bi-file-earmark-text-fill text-secondary';
    }
  }

  telecharger(cours: ElearningDoc) {
    // Simulation du téléchargement
    console.log('Accès au cours:', cours.titre);
    
    this.showSuccess = true;
    setTimeout(() => {
      this.showSuccess = false;
    }, 3000);
  }
}
