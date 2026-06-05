import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

interface StudentNote {
  id: number;
  nom: string;
  prenom: string;
  cin: string;
  avatar: string;
  noteExam: number | null;
  noteActivite: number | null;
  moyenGeneral: number | null;
}

interface Classe {
  id: string;
  nom: string;
  niveau: string;
  etudiants: StudentNote[];
}

@Component({
  selector: 'app-enseignant-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './notes.html',
  styleUrls: ['./notes.css']
})
export class NotesComponent {
  
  classes: Classe[] = [
    {
      id: 'SVT-1',
      nom: 'SVT-1',
      niveau: '1ère Année Qualifiant',
      etudiants: [
        { id: 1, nom: 'El Fassi', prenom: 'Youssef', cin: 'AE12345', avatar: 'https://ui-avatars.com/api/?name=Youssef+El+Fassi&background=random', noteExam: null, noteActivite: null, moyenGeneral: null },
        { id: 2, nom: 'Bennani', prenom: 'Amina', cin: 'CD98765', avatar: 'https://ui-avatars.com/api/?name=Amina+Bennani&background=random', noteExam: null, noteActivite: null, moyenGeneral: null },
        { id: 3, nom: 'Chraibi', prenom: 'Omar', cin: 'BK45678', avatar: 'https://ui-avatars.com/api/?name=Omar+Chraibi&background=random', noteExam: null, noteActivite: null, moyenGeneral: null }
      ]
    },
    {
      id: 'PC-1',
      nom: 'PC-1',
      niveau: '1ère Année Qualifiant',
      etudiants: [
        { id: 4, nom: 'Tahiri', prenom: 'Khadija', cin: 'X112233', avatar: 'https://ui-avatars.com/api/?name=Khadija+Tahiri&background=random', noteExam: null, noteActivite: null, moyenGeneral: null },
        { id: 5, nom: 'Amrani', prenom: 'Hassan', cin: 'Z998877', avatar: 'https://ui-avatars.com/api/?name=Hassan+Amrani&background=random', noteExam: null, noteActivite: null, moyenGeneral: null }
      ]
    }
  ];

  selectedClasseId: string = '';
  showSuccess = false;

  get currentClasse(): Classe | undefined {
    return this.classes.find(c => c.id === this.selectedClasseId);
  }

  get canShowTable(): boolean {
    return this.selectedClasseId !== '';
  }

  selectClasse(classe: Classe) {
    this.selectedClasseId = classe.id;
  }

  saveNotes() {
    if (this.currentClasse) {
      // Simulation API Call
      console.log('Sauvegarde des notes pour', this.currentClasse.nom);
      console.log(this.currentClasse.etudiants);
      
      this.showSuccess = true;
      setTimeout(() => {
        this.showSuccess = false;
      }, 3000);
    }
  }

  validateAndCalculate(student: StudentNote, field: 'noteExam' | 'noteActivite') {
    let value = student[field];
    
    // Validation
    if (value !== null) {
      if (value < 0) student[field] = 0;
      if (value > 20) student[field] = 20;
    }

    // Calculation
    if (student.noteExam !== null && student.noteActivite !== null) {
      student.moyenGeneral = (student.noteExam + student.noteActivite) / 2;
    } else {
      student.moyenGeneral = null;
    }
  }
}
