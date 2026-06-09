import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../../../core/services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface Cours {
  id: number;
  titre: string;
  description: string;
  classes: string[];
  statut: 'Publié' | 'Brouillon';
  date: string;
  fichier: string | null;
  module_id?: number;
}

@Component({
  selector: 'app-enseignant-cours',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './cours.html',
  styleUrls: ['./cours.css']
})
export class CoursComponent implements OnInit {
  private apiService: ApiService = inject(ApiService);
  
  // Liste des classes disponibles pour l'affectation (chargée du backend)
  availableClasses: string[] = [];
  classesData: any[] = [];
  
  // Modèle pour le nouveau cours
  nouveauCours = {
    titre: '',
    description: '',
    classesSelectionnees: [] as string[],
    fichier: null as File | null,
    nomFichier: ''
  };

  // Liste des cours existants (chargés du backend)
  coursPublies: Cours[] = [];

  // Propriétés de filtrage et d'UI
  recherche = '';
  filtreStatut = 'Tous';
  coursFiltres: Cours[] = [];
  modeEdition = false;
  coursEditeId: number | null = null;
  showSuccessToast = false;
  isLoading = true;
  fileErrorMessage = '';
  submissionErrors: string[] = [];

  ngOnInit() {
    this.chargerClassesEnseignant();
    this.chargerSupportsEnseignant();
  }

  /**
   * Charger les classes affectées à l'enseignant connecté depuis le backend
   */
  chargerClassesEnseignant() {
    this.apiService.getEnseignantProfile().subscribe({
      next: (profile: any) => {
        const classes = profile.classes ?? profile.enseignant?.classes ?? [];
        if (classes && classes.length > 0) {
          this.classesData = classes;
          this.availableClasses = classes.map((classe: any) => classe.nom || classe.nom_classe || classe.designation || 'Classe inconnue');
        } else {
          this.availableClasses = [];
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des classes', err);
        this.availableClasses = [];
        this.isLoading = false;
      }
    });
  }

  /**
   * Charger les supports (documents de cours) de l'enseignant depuis le backend
   */
  chargerSupportsEnseignant() {
    this.apiService.getEnseignantSupports().subscribe({
      next: (supports: any[]) => {
        this.coursPublies = supports.map((support: any) => ({
          id: support.id,
          titre: support.titre,
          description: support.description || '',
          classes: support.classes || [],
          statut: 'Publié',
          date: support.created_at ? new Date(support.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          fichier: support.nom_fichier || support.titre,
          module_id: support.id_module // Stocker le module ID pour la suppression
        }));
        this.appliquerFiltres();
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des supports', err);
        this.coursPublies = [];
      }
    });
  }

  // Gérer la sélection du fichier
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.fileErrorMessage = 'Veuillez sélectionner un fichier PDF.';
        this.nouveauCours.fichier = null;
        this.nouveauCours.nomFichier = '';
        return;
      }
      this.fileErrorMessage = '';
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

    if (!this.nouveauCours.fichier) {
      alert('Veuillez sélectionner un fichier PDF');
      return;
    }

    if (this.nouveauCours.fichier.type !== 'application/pdf') {
      alert('Le fichier doit être un PDF.');
      return;
    }

    // Pour les classes sélectionnées, créer un support pour chaque module enseigné dans ces classes
    this.creerSupportsClasses();
  }

  /**
   * Créer des supports pour les classes sélectionnées
   * Pour chaque classe, on crée un support pour chaque module de l'enseignant dans cette classe
   */
  private creerSupportsClasses() {
    if (this.nouveauCours.classesSelectionnees.length === 0) {
      alert('Veuillez sélectionner au moins une classe');
      return;
    }

    // Collecter tous les modules uniques des classes sélectionnées
    const modulesIds = new Set<number>();
    const missingModuleClasses: string[] = [];

    this.classesData.forEach((classe: any) => {
      const classLabel = classe.nom || classe.nom_classe || classe.designation || 'Classe inconnue';
      if (this.nouveauCours.classesSelectionnees.includes(classLabel)) {
        const modules = classe.modules ?? classe.modules_list ?? [];
        if (!modules || modules.length === 0) {
          missingModuleClasses.push(classLabel);
          return;
        }

        modules.forEach((module: any) => {
          const moduleId = module.id ?? module.module_id ?? module.id_module ?? module.moduleId;
          if (typeof moduleId === 'number') {
            modulesIds.add(moduleId);
          } else {
            console.warn(`Module sans identifiant trouvé pour la classe ${classLabel}`, module);
          }
        });
      }
    });

    if (missingModuleClasses.length > 0) {
      alert(`Aucun module trouvé pour les classes suivantes : ${missingModuleClasses.join(', ')}`);
      return;
    }

    if (modulesIds.size === 0) {
      alert('Aucun module valide trouvé pour les classes sélectionnées');
      return;
    }

    const requests = Array.from(modulesIds).map((moduleId) =>
      this.apiService.createSupport(
        moduleId,
        this.nouveauCours.titre,
        this.nouveauCours.description,
        this.nouveauCours.fichier!
      ).pipe(
        catchError((err: any) => {
          console.error(`Erreur lors de la création du support pour module ${moduleId}:`, err);
          return of({ success: false, moduleId, error: err });
        })
      )
    );

    forkJoin(requests).subscribe((results) => {
      const successResults = results.filter((result: any) => result && result.success !== false);
      const failedResults = results.filter((result: any) => result && result.success === false);

      if (successResults.length > 0) {
        this.reinitialiserFormulaire();
        this.appliquerFiltres();
        this.chargerSupportsEnseignant();
        this.afficherToast();
      }

      if (failedResults.length > 0) {
        this.submissionErrors = failedResults.map((result: any) => {
          const moduleId = result.moduleId;
          const message = result.error?.message || result.error?.statusText || 'Erreur inconnue';
          return `Module ${moduleId} : ${message}`;
        });
        alert(`Certains supports n’ont pas pu être ajoutés :\n${this.submissionErrors.join('\n')}`);
      }
    });
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
  supprimerCours(cours: Cours) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document de cours ?')) {
      if (cours.id && cours.module_id) {
        this.apiService.deleteSupport(cours.module_id, cours.id).subscribe({
          next: () => {
            this.coursPublies = this.coursPublies.filter(c => c.id !== cours.id);
            this.appliquerFiltres();
          },
          error: (err: any) => {
            console.error('Erreur lors de la suppression du support', err);
            alert('Erreur lors de la suppression du support');
          }
        });
      }
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
