import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../../../core/services/api.service';
import { PaginationComponent } from '../../../shared/pagination/pagination';

interface MappedModule {
  id: number;
  nom: string;
  masse_horraire: number;
  enseignant: {
    id: number;
    nom: string;
    prenom: string;
  } | null;
  note: any | null;
  isAvailable: boolean;
}

@Component({
  selector: 'app-etudiant-resultats',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './resultats.html',
  styleUrls: ['./resultats.css']
})
export class EtudiantResultatsComponent implements OnInit {
  studentProfile: any = null;
  classNotes: any[] = [];
  mappedModules: MappedModule[] = [];
  isLoading = false;
  errorMessage = '';

  currentPage = 1;
  pageSize = 10;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.apiService.getEtudiantProfile().subscribe({
      next: (profile) => {
        this.studentProfile = profile;
        
        // Fetch published notes for this student's class
        this.apiService.getStudentNotes().subscribe({
          next: (notes) => {
            this.classNotes = notes;
            this.mapModulesAndNotes();
            this.isLoading = false;
          },
          error: (err) => {
            this.errorMessage = err.message || 'Erreur lors du chargement des notes.';
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement de votre profil.';
        this.isLoading = false;
      }
    });
  }

  mapModulesAndNotes() {
    const modules = this.studentProfile?.classe?.modules || [];
    this.mappedModules = modules.map((module: any) => {
      const note = this.classNotes.find(n => n.module_id === module.id);
      return {
        id: module.id,
        nom: module.nom,
        masse_horraire: module.masse_horraire,
        enseignant: module.enseignant,
        note: note || null,
        isAvailable: !!note
      };
    });
  }

  get totalModules(): number {
    return this.mappedModules.length;
  }

  get publishedNotesCount(): number {
    return this.mappedModules.filter(m => m.isAvailable).length;
  }

  get paginatedModules() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.mappedModules.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  downloadNote(module: MappedModule) {
    if (!module.isAvailable || !module.note) return;
    
    const classeId = this.studentProfile?.classe?.id;
    if (!classeId) return;

    this.apiService.downloadNoteFile(classeId, module.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = module.note.nom_fichier || `${module.nom}_Note.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du téléchargement de la note.';
      }
    });
  }
}
