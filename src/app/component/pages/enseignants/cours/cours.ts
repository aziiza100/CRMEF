import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

interface Cours {
  id: number;
  titre: string;
  description: string;
  classes: string[];
  statut: 'Publié' | 'Brouillon';
  date: string;
  fichier: string | null;
}

@Component({
  selector: 'app-enseignant-cours',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './cours.html',
  styleUrls: ['./cours.css']
})
export class CoursComponent implements OnInit {
  // Liste des classes disponibles pour l'affectation
  availableClasses = ['SVT-1', 'SVT-2', 'PC-1', 'PC-2', 'Maths-1', 'Maths-2'];
  
  // Modèle pour le nouveau cours
  nouveauCours = {
    titre: '',
    description: '',
    classesSelectionnees: [] as string[],
    fichier: null as File | null,
    nomFichier: ''
  };

  // Liste des cours existants (mock)
  coursPublies: Cours[] = [
    {
      id: 1,
      titre: 'Didactique des SVT - Chapitre 1',
      description: 'Introduction aux concepts fondamentaux de la didactique.',
      classes: ['SVT-1', 'SVT-2'],
      statut: 'Publié',
      date: '2023-10-15',
      fichier: 'didactique_chap1.pdf'
    },
    {
      id: 2,
      titre: 'TP : Écologie pratique',
      description: 'Guide pour les sorties écologiques avec les élèves.',
      classes: ['SVT-2'],
      statut: 'Brouillon',
      date: '2023-11-02',
      fichier: null
    }
  ];

  // Propriétés de filtrage et d'UI
  recherche = '';
  filtreStatut = 'Tous';
  coursFiltres: Cours[] = [];
  modeEdition = false;
  coursEditeId: number | null = null;
  showSuccessToast = false;

  ngOnInit() {
    this.appliquerFiltres();
  }

  // Gérer la sélection du fichier (simulation)
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.nouveauCours.fichier = file;
      this.nouveauCours.nomFichier = file.name;
    }
  }

  // Gérer la sélection multiple des classes (checkboxes)
  toggleClasse(classe: string) {
    const index = this.nouveauCours.classesSelectionnees.indexOf(classe);
    if (index > -1) {
      this.nouveauCours.classesSelectionnees.splice(index, 1);
    } else {
      this.nouveauCours.classesSelectionnees.push(classe);
    }
  }

  get allClassesSelected(): boolean {
    return this.nouveauCours.classesSelectionnees.length === this.availableClasses.length && this.availableClasses.length > 0;
  }

  toggleToutesClasses() {
    if (this.allClassesSelected) {
      this.nouveauCours.classesSelectionnees = [];
    } else {
      this.nouveauCours.classesSelectionnees = [...this.availableClasses];
    }
  }

  // Soumettre le formulaire
  soumettreCours(statut: 'Publié' | 'Brouillon') {
    if (!this.nouveauCours.titre) return;

    if (this.modeEdition && this.coursEditeId) {
      // Modification
      const index = this.coursPublies.findIndex(c => c.id === this.coursEditeId);
      if (index > -1) {
        this.coursPublies[index] = {
          ...this.coursPublies[index],
          titre: this.nouveauCours.titre,
          description: this.nouveauCours.description,
          classes: [...this.nouveauCours.classesSelectionnees],
          statut: statut,
          fichier: this.nouveauCours.nomFichier || this.coursPublies[index].fichier
        };
      }
      this.modeEdition = false;
      this.coursEditeId = null;
    } else {
      // Ajout
      const newId = Math.max(...this.coursPublies.map(c => c.id), 0) + 1;
      this.coursPublies.unshift({
        id: newId,
        titre: this.nouveauCours.titre,
        description: this.nouveauCours.description,
        classes: [...this.nouveauCours.classesSelectionnees],
        statut: statut,
        date: new Date().toISOString().split('T')[0],
        fichier: this.nouveauCours.nomFichier || null
      });
    }

    this.reinitialiserFormulaire();
    this.appliquerFiltres();
    this.afficherToast();
  }

  // Éditer un cours
  editerCours(cours: Cours) {
    this.modeEdition = true;
    this.coursEditeId = cours.id;
    this.nouveauCours = {
      titre: cours.titre,
      description: cours.description,
      classesSelectionnees: [...cours.classes],
      fichier: null,
      nomFichier: cours.fichier || ''
    };
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Supprimer un cours
  supprimerCours(id: number) {
    if(confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      this.coursPublies = this.coursPublies.filter(c => c.id !== id);
      this.appliquerFiltres();
    }
  }

  // Annuler l'édition
  annulerEdition() {
    this.modeEdition = false;
    this.coursEditeId = null;
    this.reinitialiserFormulaire();
  }

  reinitialiserFormulaire() {
    this.nouveauCours = {
      titre: '',
      description: '',
      classesSelectionnees: [],
      fichier: null,
      nomFichier: ''
    };
    // Reset file input UI
    const fileInput = document.getElementById('fichierCours') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  appliquerFiltres() {
    this.coursFiltres = this.coursPublies.filter(cours => {
      const matchRecherche = cours.titre.toLowerCase().includes(this.recherche.toLowerCase()) || 
                             cours.description.toLowerCase().includes(this.recherche.toLowerCase());
      const matchStatut = this.filtreStatut === 'Tous' || cours.statut === this.filtreStatut;
      return matchRecherche && matchStatut;
    });
  }

  afficherToast() {
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 3000);
  }
}
