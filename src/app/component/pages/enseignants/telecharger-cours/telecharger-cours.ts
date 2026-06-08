import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../../../core/services/api.service';

interface SupportDoc {
  id: number;
  id_module: number;
  module_nom: string;
  titre: string;
  nom_fichier: string;
  description: string | null;
  auteur: string;
  created_at: string;
}

@Component({
  selector: 'app-enseignant-telecharger-cours',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './telecharger-cours.html',
  styleUrls: ['./telecharger-cours.css']
})
export class TelechargerCoursComponent implements OnInit {
  searchTerm: string = '';
  selectedSpecialty: string = 'all';
  showSuccess = false;
  isLoading = false;
  errorMessage = '';

  specialties = [
    { value: 'all', labelKey: 'telechargerCours.allSpecialties' },
    { value: 'svt', labelKey: 'telechargerCours.specialties.svt' },
    { value: 'math', labelKey: 'telechargerCours.specialties.math' },
    { value: 'pc', labelKey: 'telechargerCours.specialties.pc' },
    { value: 'didactique', labelKey: 'telechargerCours.specialties.didactique' }
  ];

  coursList: SupportDoc[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadSupports();
  }

  loadSupports() {
    this.isLoading = true;
    this.errorMessage = '';
    this.apiService.getSupports().subscribe({
      next: (data) => {
        this.coursList = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des cours.';
        this.isLoading = false;
      }
    });
  }

  // Parse specialty dynamically from module name to filter correctly
  getSpecialty(moduleNom: string): string {
    if (!moduleNom) return 'didactique';
    const nom = moduleNom.toLowerCase();
    if (nom.includes('svt') || nom.includes('vie') || nom.includes('terre') || nom.includes('biol') || nom.includes('geol')) {
      return 'svt';
    }
    if (nom.includes('math') || nom.includes('alg') || nom.includes('geom') || nom.includes('anal')) {
      return 'math';
    }
    if (nom.includes('pc') || nom.includes('phys') || nom.includes('chim')) {
      return 'pc';
    }
    return 'didactique'; // Default specialty
  }

  get filteredCours(): SupportDoc[] {
    return this.coursList.filter(cours => {
      const matchSearch = (cours.titre && cours.titre.toLowerCase().includes(this.searchTerm.toLowerCase())) || 
                          (cours.description && cours.description.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
                          (cours.auteur && cours.auteur.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
                          (cours.module_nom && cours.module_nom.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const specialty = this.getSpecialty(cours.module_nom);
      const matchSpecialty = this.selectedSpecialty === 'all' || specialty === this.selectedSpecialty;
      
      return matchSearch && matchSpecialty;
    });
  }

  telecharger(cours: SupportDoc) {
    this.errorMessage = '';
    this.apiService.downloadSupportFile(cours.id_module, cours.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = cours.nom_fichier;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showSuccess = true;
        setTimeout(() => {
          this.showSuccess = false;
        }, 3000);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du téléchargement du fichier.';
      }
    });
  }
}
