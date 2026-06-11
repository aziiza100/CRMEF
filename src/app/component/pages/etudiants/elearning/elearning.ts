import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../../../core/services/api.service';

interface ElearningDoc {
  id: number;
  titre: string;
  description: string;
  id_module: number;
  nom_fichier: string;
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
export class ElearningComponent implements OnInit {
  
  searchTerm: string = '';
  selectedMatiere: string = 'all'; // contiendra l'ID du module ou 'all'
  showSuccess = false;
  isLoading = false;
  
  matieres: any[] = [{ value: 'all', label: 'Toutes les matières' }];
  coursList: ElearningDoc[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadElearningData();
  }

  loadElearningData() {
    this.isLoading = true;
    // 1. Récupérer le profil de l'étudiant connecté pour obtenir ses modules (matières)
    this.apiService.getEtudiantProfile().subscribe({
      next: (profile) => {
        const studentModules = profile?.classe?.modules || [];
        
        // Remplir dynamiquement la liste des filtres matières
        this.matieres = [
          { value: 'all', label: 'Toutes les matières' },
          ...studentModules.map((m: any) => ({ value: m.id.toString(), label: m.nom }))
        ];

        // 2. Charger les fichiers de cours pour chaque module
        this.coursList = [];
        studentModules.forEach((mod: any) => {
          this.apiService.getSupportsForModule(mod.id).subscribe({
            next: (supports: any[]) => {
              const formattedSupports = supports.map(sup => ({
                id: sup.id,
                titre: sup.titre || sup.nom_fichier,
                description: sup.description || 'Aucune description disponible',
                id_module: mod.id,
                nom_fichier: sup.nom_fichier,
                professeur: sup.enseignant || 'Non assigné',
                dateMiseEnLigne: new Date(sup.created_at).toLocaleDateString(),
                format: this.detectFormat(sup.nom_fichier),
                isNew: (new Date().getTime() - new Date(sup.created_at).getTime()) < (3 * 24 * 60 * 60 * 1000) // Nouveau si < 3 jours
              }));
              this.coursList = [...this.coursList, ...formattedSupports];
            }
          });
        });
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private detectFormat(filename: string): 'pdf' | 'video' | 'doc' {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['mp4', 'avi', 'mkv'].includes(ext || '')) return 'video';
    if (['doc', 'docx', 'odt'].includes(ext || '')) return 'doc';
    return 'pdf';
  }

  get filteredCours(): ElearningDoc[] {
    return this.coursList.filter(cours => {
      const matchSearch = cours.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                          cours.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchMatiere = this.selectedMatiere === 'all' || cours.id_module.toString() === this.selectedMatiere;
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
    this.apiService.downloadSupportFile(cours.id_module, cours.id).subscribe({
      next: (blob: Blob) => {
        const fileBlob = new Blob([blob], { type: blob.type });
        const url = window.URL.createObjectURL(fileBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = cours.nom_fichier;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showSuccess = true;
        setTimeout(() => this.showSuccess = false, 3000);
      }
    });
  }
}