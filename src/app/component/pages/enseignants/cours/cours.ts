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
  classes: string[]; // Tableau de chaînes pour l'affichage
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
  
  availableClasses: string[] = [];
  classesData: any[] = [];
  
  nouveauCours = {
    titre: '',
    description: '',
    classesSelectionnees: [] as string[],
    fichier: null as File | null,
    nomFichier: ''
  };

  coursPublies: Cours[] = [];
  coursFiltres: Cours[] = [];
  recherche = '';
  filtreStatut = 'Tous';
  modeEdition = false;
  coursEditeId: number | null = null;
  showSuccessToast = false;
  isLoading = true;
  fileErrorMessage = '';
  submissionErrors: string[] = [];

  ngOnInit() { 
    this.chargerClassesEnseignant();
  }

  chargerClassesEnseignant() {
    this.apiService.getEnseignantProfile().subscribe({
      next: (profile: any) => {
        const classes = profile.classes ?? profile.enseignant?.classes ?? [];
        this.classesData = classes;
        this.availableClasses = classes.map((classe: any) => classe.nom || classe.nom_classe || classe.designation || 'Classe inconnue');
        this.chargerSupportsEnseignant();
      },
      error: (err) => console.error(err)
    });
  }

  chargerSupportsEnseignant() {
    this.apiService.getEnseignantSupports().subscribe({
      next: (supports: any[]) => {
        this.coursPublies = supports.map((support: any) => {
          // Extraire les noms des classes associées à ce support
          let classesNoms: string[] = [];
          if (support.classes && support.classes.length > 0) {
            classesNoms = support.classes.map((c: any) => c.nom || c.nom_classe || 'Classe');
          }

          return {
            id: support.id,
            titre: support.titre,
            description: support.description || '',
            classes: classesNoms,
            statut: 'Publié',
            date: support.created_at ? new Date(support.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            fichier: support.nom_fichier || support.titre,
            module_id: support.id_module
          };
        });
        this.appliquerFiltres();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des supports', err);
        this.coursPublies = [];
        this.isLoading = false;
      }
    }); 
  }

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

  soumettreCours(statut: 'Publié' | 'Brouillon') {
    if (!this.nouveauCours.titre) return;

    if (this.modeEdition) {
      this.executerMiseAJour();
      return;
    }

    if (!this.nouveauCours.fichier) {
      alert('Veuillez sélectionner un fichier PDF');
      return;
    }

    this.creerSupportsClasses();
  }

  private creerSupportsClasses() {
    if (this.nouveauCours.classesSelectionnees.length === 0) {
      alert('Veuillez sélectionner au moins une classe');
      return;
    }

    const modulesIds = new Set<number>();
    this.classesData.forEach((classe: any) => {
      const classLabel = classe.nom || classe.nom_classe || 'Classe inconnue';
      if (this.nouveauCours.classesSelectionnees.includes(classLabel)) {
        const modules = classe.modules ?? classe.modules_list ?? [];
        modules.forEach((module: any) => {
          const moduleId = module.id ?? module.module_id;
          if (moduleId) modulesIds.add(moduleId);
        });
      }
    });

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
        catchError((err: any) => of({ success: false, moduleId, error: err }))
      )
    );

    this.isLoading = true;
    forkJoin(requests).subscribe((results) => {
      const failedResults = results.filter((result: any) => result && result.success === false);

      this.reinitialiserFormulaire();
      this.chargerSupportsEnseignant();
      this.afficherToast();

      if (failedResults.length > 0) {
        alert('Certains supports n’ont pas pu être ajoutés.');
      }
    });
  }

  executerMiseAJour() {
    if (!this.coursEditeId || !this.nouveauCours.titre) return;

    // Trouver le cours en cours d'édition pour récupérer son module_id original
    const coursEnCours = this.coursPublies.find(c => c.id === this.coursEditeId);
    const mId = coursEnCours?.module_id;

    if (!mId) {
      alert('Erreur: Impossible de localiser le module associé.');
      return;
    }

    this.isLoading = true;
    this.apiService.updateSupport(
      mId,
      this.coursEditeId,
      this.nouveauCours.titre,
      this.nouveauCours.description,
      this.nouveauCours.fichier || undefined
    ).subscribe({
      next: () => {
        this.modeEdition = false;
        this.coursEditeId = null;
        this.reinitialiserFormulaire();
        this.chargerSupportsEnseignant();
        this.afficherToast();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        alert('Erreur lors de la modification.');
      }
    });
  }

 // Éditer un cours
  editerCours(cours: Cours) {
    this.modeEdition = true;
    this.coursEditeId = cours.id;

    // 1. Tableau bach n-jma3o fih les noms dial les classes li khasshom yt-cochaw (Strings)
    const classesDuCours: string[] = [];

    // --- ÉTAPE A: Check b module_id daxel classesData ---
    if (cours.module_id && this.classesData && this.classesData.length > 0) {
      this.classesData.forEach((classe: any) => {
        // Jbed s-miya dyal l-classe safe
        const classLabel = classe.nom || classe.nom_classe || classe.designation;
        if (!classLabel) return;

        const modules = classe.modules ?? classe.modules_list ?? [];
        
        // Ila had l-classe fiha dak l-module_id, n-zidiw s-miya dyalha
        const hasModule = modules.some((mod: any) => {
          const mId = mod.id ?? mod.module_id ?? mod.id_module ?? mod.moduleId;
          return Number(mId) === Number(cours.module_id); // Convert to number safely
        });

        if (hasModule && !classesDuCours.includes(classLabel)) {
          classesDuCours.push(classLabel);
        }
      });
    }

    // --- ÉTAPE B: Fallback (Ila classesDuCours b9at khawya, n-chdo direct chno rje3 m l-Backend) ---
    if (classesDuCours.length === 0 && cours.classes && cours.classes.length > 0) {
      cours.classes.forEach((c: any) => {
        if (typeof c === 'string') {
          if (!classesDuCours.includes(c)) classesDuCours.push(c);
        } else if (c && typeof c === 'object') {
          const nomClasse = c.nom || c.nom_classe || c.designation;
          if (nomClasse && !classesDuCours.includes(nomClasse)) {
            classesDuCours.push(nomClasse);
          }
        }
      });
    }

    // --- ÉTAPE C: Ultra Fallback (Ila b9at khawya, checki s-miya nishan m3a availableClasses) ---
    if (classesDuCours.length === 0 && this.availableClasses && this.availableClasses.length > 0) {
      // Hna ila kan cours.classes fih ghir strings o bgha y-matchi m3a availableClasses direct
      this.availableClasses.forEach((avClasse: string) => {
        if (cours.classes && cours.classes.some((c: any) => {
          const name = typeof c === 'string' ? c : (c.nom || c.nom_classe || '');
          return name.toLowerCase().trim() === avClasse.toLowerCase().trim();
        })) {
          if (!classesDuCours.includes(avClasse)) classesDuCours.push(avClasse);
        }
      });
    }

    // 2. Remplir l-formulaire o hna les classes ghadi y-bano m-cochyine 100%
    this.nouveauCours = {
      titre: cours.titre,
      description: cours.description || '',
      classesSelectionnees: classesDuCours, // <--- Tableau de strings [ "FBR 1", ... ]
      fichier: null,
      nomFichier: cours.fichier || ''
    };

    // Scroll to top cleanly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  supprimerCours(cours: Cours) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document de cours ?')) {
      if (cours.id && cours.module_id) {
        this.apiService.deleteSupport(cours.module_id, cours.id).subscribe({
          next: () => {
            this.coursPublies = this.coursPublies.filter(c => c.id !== cours.id);
            this.appliquerFiltres();
          },
          error: (err: any) => {
            console.error(err);
            alert('Erreur lors de la suppression.');
          }
        });
      }
    }
  }

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
    setTimeout(() => this.showSuccessToast = false, 3000);
  }
}