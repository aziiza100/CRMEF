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
 
@Component({
  selector: 'app-enseignant-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './notes.html',
  styleUrls: ['./notes.css']
})
export class NotesComponent implements OnInit {
  classes: Classe[] = [];
  selectedClasseId: number | null = null;
  selectedModuleId: number | null = null;
  
  currentNote: any = null;
  selectedFile: File | null = null;
  nomFichier: string = '';

  isLoading: boolean = false;
  isUploading: boolean = false;
  showSuccess: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadEnseignantProfile();
  }

  loadEnseignantProfile() {
    this.isLoading = true;
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
    this.currentNote = null;
    this.selectedFile = null;
    this.nomFichier = '';
    this.errorMessage = '';
  }

  onModuleChange() {
    this.currentNote = null;
    this.selectedFile = null;
    this.nomFichier = '';
    this.errorMessage = '';
    
    if (this.selectedClasseId && this.selectedModuleId) {
      this.loadNoteStatus();
    }
  }

  loadNoteStatus() {
    if (!this.selectedClasseId || !this.selectedModuleId) return;
    this.isLoading = true;
    this.apiService.getNoteForClassAndModule(this.selectedClasseId, this.selectedModuleId).subscribe({
      next: (note) => {
        this.currentNote = note;
        this.isLoading = false;
      },
      error: (err) => {
        this.currentNote = null;
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.errorMessage = 'Veuillez sélectionner un fichier PDF uniquement.';
        this.selectedFile = null;
        this.nomFichier = '';
        return;
      }
      this.selectedFile = file;
      this.nomFichier = file.name;
      this.errorMessage = '';
    }
  }

  uploadNote() {
    if (!this.selectedClasseId || !this.selectedModuleId || !this.selectedFile) return;

    this.isUploading = true;
    this.errorMessage = '';
    this.apiService.uploadNote(this.selectedClasseId, this.selectedModuleId, this.selectedFile).subscribe({
      next: (response) => {
        this.isUploading = false;
        this.showSuccess = true;
        this.successMessage = response.message || 'Note enregistrée avec succès.';
        this.selectedFile = null;
        this.nomFichier = '';
        this.loadNoteStatus();
        setTimeout(() => {
          this.showSuccess = false;
        }, 3000);
      },
      error: (err) => {
        this.isUploading = false;
        this.errorMessage = err.message || 'Erreur lors de l\'enregistrement de la note.';
      }
    });
  }

  deleteNote() {
    if (!this.selectedClasseId || !this.selectedModuleId) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.apiService.deleteNote(this.selectedClasseId, this.selectedModuleId).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showSuccess = true;
        this.successMessage = response.message || 'Note supprimée avec succès.';
        this.currentNote = null;
        setTimeout(() => {
          this.showSuccess = false;
        }, 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Erreur lors de la suppression de la note.';
      }
    });
  }

 downloadNote(module: Module) {
    // Dans l'espace enseignant, on utilise l'ID de la classe sélectionnée dans le formulaire
    const classeId = this.selectedClasseId;
    if (!classeId || !module || !module.id) return;

    this.apiService.downloadNoteFile(classeId, module.id).subscribe({
      next: (blob: Blob) => {
        // Forcer le type MIME en PDF au cas où le serveur omet l'entête
        const fileBlob = new Blob([blob], { type: 'application/pdf' });
        
        const url = window.URL.createObjectURL(fileBlob);
        const a = document.createElement('a');
        a.href = url;
        
        // Récupération du nom du fichier existant ou génération d'un nom par défaut
        const fileName = this.currentNote?.nom_fichier || `${module.nom}_Note.pdf`;
        a.download = fileName;
        
        document.body.appendChild(a);
        a.click();
        
        // Nettoyage de la mémoire du navigateur
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erreur download:', err);
        this.errorMessage = 'Erreur lors du téléchargement de la note.';
      }
    });
  }
}
