import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../../../core/services/api.service';

interface Module {
  id: number;
  nom: string;
  masse_horraire: number;
}

interface Classe {
  id: number;
  nom: string;
  niveau: string;
  modules: Module[];
}

interface Support {
  id: number;
  id_module: number;
  titre: string;
  nom_fichier: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-enseignant-cours',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './cours.html',
  styleUrls: ['./cours.css']
})
export class CoursComponent implements OnInit {
  classes: Classe[] = [];
  selectedClasseId: number | null = null;
  selectedModuleId: number | null = null;

  // Form Model
  nouveauCours = {
    titre: '',
    description: '',
    fichier: null as File | null,
    nomFichier: ''
  };

  // State Management
  supports: Support[] = [];
  recherche = '';
  modeEdition = false;
  coursEditeId: number | null = null;
  
  isLoading = false;
  isSaving = false;
  showSuccessToast = false;
  successMessage = '';
  errorMessage = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadEnseignantProfile();
  }

  loadEnseignantProfile() {
    this.isLoading = true;
    this.errorMessage = '';
    this.apiService.getEnseignantProfile().subscribe({
      next: (profile) => {
        this.classes = profile.classes || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des classes.';
        this.isLoading = false;
      }
    });
  }

  get currentClasse(): Classe | undefined {
    return this.classes.find(c => c.id === this.selectedClasseId);
  }

  get availableModules(): Module[] {
    return this.currentClasse ? this.currentClasse.modules : [];
  }

  onClasseChange() {
    this.selectedModuleId = null;
    this.supports = [];
    this.reinitialiserFormulaire();
    this.errorMessage = '';
  }

  onModuleChange() {
    this.supports = [];
    this.reinitialiserFormulaire();
    this.errorMessage = '';
    
    if (this.selectedModuleId) {
      this.loadSupports();
    }
  }

  loadSupports() {
    if (!this.selectedModuleId) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.apiService.getSupportsForModule(this.selectedModuleId).subscribe({
      next: (data) => {
        this.supports = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des supports.';
        this.isLoading = false;
      }
    });
  }

  // Handle PDF file selection
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.errorMessage = 'Veuillez sélectionner un fichier PDF uniquement.';
        this.nouveauCours.fichier = null;
        this.nouveauCours.nomFichier = '';
        return;
      }
      this.nouveauCours.fichier = file;
      this.nouveauCours.nomFichier = file.name;
      this.errorMessage = '';
    }
  }

  // Form submission (Add / Edit)
  soumettreCours() {
    if (!this.selectedModuleId || !this.nouveauCours.titre) return;
    
    // File validation for new courses
    if (!this.modeEdition && !this.nouveauCours.fichier) {
      this.errorMessage = 'Veuillez sélectionner un fichier PDF de cours.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    if (this.modeEdition && this.coursEditeId) {
      // Edit mode
      this.apiService.updateSupport(
        this.selectedModuleId, 
        this.coursEditeId, 
        this.nouveauCours.titre, 
        this.nouveauCours.description, 
        this.nouveauCours.fichier
      ).subscribe({
        next: (response) => {
          this.isSaving = false;
          this.modeEdition = false;
          this.coursEditeId = null;
          this.reinitialiserFormulaire();
          this.loadSupports();
          this.afficherToast('Cours mis à jour avec succès !');
        },
        error: (err) => {
          this.isSaving = false;
          this.errorMessage = err.message || 'Erreur lors de la mise à jour du cours.';
        }
      });
    } else {
      // Add mode
      this.apiService.uploadSupport(
        this.selectedModuleId, 
        this.nouveauCours.titre, 
        this.nouveauCours.description, 
        this.nouveauCours.fichier!
      ).subscribe({
        next: (response) => {
          this.isSaving = false;
          this.reinitialiserFormulaire();
          this.loadSupports();
          this.afficherToast('Cours publié avec succès !');
        },
        error: (err) => {
          this.isSaving = false;
          this.errorMessage = err.message || 'Erreur lors du dépôt du cours.';
        }
      });
    }
  }

  // Edit action
  editerCours(cours: Support) {
    this.modeEdition = true;
    this.coursEditeId = cours.id;
    this.nouveauCours = {
      titre: cours.titre,
      description: cours.description || '',
      fichier: null,
      nomFichier: cours.nom_fichier
    };
    this.errorMessage = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Delete action
  supprimerCours(id: number) {
    if (!this.selectedModuleId) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      this.isLoading = true;
      this.errorMessage = '';
      this.apiService.deleteSupport(this.selectedModuleId, id).subscribe({
        next: (response) => {
          this.loadSupports();
          this.afficherToast('Cours supprimé avec succès !');
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Erreur lors de la suppression du cours.';
        }
      });
    }
  }

  // Download action
  telechargerCours(cours: Support) {
    if (!this.selectedModuleId) return;
    this.apiService.downloadSupportFile(this.selectedModuleId, cours.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = cours.nom_fichier;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du téléchargement du fichier.';
      }
    });
  }

  // Cancel Edit mode
  annulerEdition() {
    this.modeEdition = false;
    this.coursEditeId = null;
    this.reinitialiserFormulaire();
  }

  reinitialiserFormulaire() {
    this.nouveauCours = {
      titre: '',
      description: '',
      fichier: null,
      nomFichier: ''
    };
    const fileInput = document.getElementById('fichierCours') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  get coursFiltres(): Support[] {
    return this.supports.filter(s => {
      const matchRecherche = s.titre.toLowerCase().includes(this.recherche.toLowerCase()) || 
                             (s.description && s.description.toLowerCase().includes(this.recherche.toLowerCase()));
      return matchRecherche;
    });
  }

  afficherToast(message: string) {
    this.successMessage = message;
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
      this.successMessage = '';
    }, 3000);
  }
}
