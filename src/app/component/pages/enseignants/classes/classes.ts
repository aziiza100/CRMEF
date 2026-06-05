import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

interface Student {
  id: number;
  nom: string;
  prenom: string;
  cin: string;
  email: string;
  avatar: string;
}

interface Classe {
  id: string;
  nom: string;
  niveau: string;
  etudiants: Student[];
}

@Component({
  selector: 'app-enseignant-classes',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './classes.html',
  styleUrls: ['./classes.css']
})
export class ClassesComponent {
  
  // Simulation de la base de données des classes et étudiants
  classes: Classe[] = [
    {
      id: 'SVT-1',
      nom: 'SVT-1',
      niveau: '1ère Année Qualifiant',
      etudiants: [
        { id: 1, nom: 'El Fassi', prenom: 'Youssef', cin: 'AE12345', email: 'y.elfassi@crmef.ma', avatar: 'https://ui-avatars.com/api/?name=Youssef+El+Fassi&background=random' },
        { id: 2, nom: 'Bennani', prenom: 'Amina', cin: 'CD98765', email: 'a.bennani@crmef.ma', avatar: 'https://ui-avatars.com/api/?name=Amina+Bennani&background=random' },
        { id: 3, nom: 'Chraibi', prenom: 'Omar', cin: 'BK45678', email: 'o.chraibi@crmef.ma', avatar: 'https://ui-avatars.com/api/?name=Omar+Chraibi&background=random' }
      ]
    },
    {
      id: 'PC-1',
      nom: 'PC-1',
      niveau: '1ère Année Qualifiant',
      etudiants: [
        { id: 4, nom: 'Tahiri', prenom: 'Khadija', cin: 'X112233', email: 'k.tahiri@crmef.ma', avatar: 'https://ui-avatars.com/api/?name=Khadija+Tahiri&background=random' },
        { id: 5, nom: 'Amrani', prenom: 'Hassan', cin: 'Z998877', email: 'h.amrani@crmef.ma', avatar: 'https://ui-avatars.com/api/?name=Hassan+Amrani&background=random' }
      ]
    },
    {
      id: 'MATH-2',
      nom: 'Math-2',
      niveau: '2ème Année Qualifiant',
      etudiants: [] // Classe vide pour tester
    }
  ];

  selectedClasse: Classe | null = null;
  searchTerm: string = '';

  selectClasse(classe: Classe) {
    this.selectedClasse = classe;
    this.searchTerm = ''; // Reset search on new class
  }

  get filteredStudents(): Student[] {
    if (!this.selectedClasse) return [];
    
    if (!this.searchTerm.trim()) {
      return this.selectedClasse.etudiants;
    }

    const term = this.searchTerm.toLowerCase();
    return this.selectedClasse.etudiants.filter(student => 
      student.nom.toLowerCase().includes(term) ||
      student.prenom.toLowerCase().includes(term) ||
      student.cin.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term)
    );
  }

  exportList() {
    alert('Fonctionnalité d\'export (Excel/PDF) en cours de développement.');
  }
}
