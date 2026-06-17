import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../../../core/services/api.service';
import { PaginationComponent } from '../../../shared/pagination/pagination';

interface Student {
  id: number;
  nom: string;
  prenom: string;
  cne: string;
  email: string;
  avatar: string;
}

interface Classe {
  id: any;
  nom: string;
  niveau: string;
  etudiants: Student[];
}

@Component({
  selector: 'app-enseignant-classes',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PaginationComponent],
  templateUrl: './classes.html',
  styleUrls: ['./classes.css']
})
export class ClassesComponent implements OnInit {
  classes: Classe[] = [];
  selectedClasse: Classe | null = null;
  searchTerm: string = '';
  isLoading = false;

  currentPage = 1;
  pageSize = 10;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadClasses();
  }

  loadClasses() {
    this.isLoading = true;
    this.api.getEnseignantProfile().subscribe({
      next: (profile) => {
        this.classes = profile.classes || [];
        this.isLoading = false;
        if (this.classes.length > 0) {
          this.selectClasse(this.classes[0]);
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  selectClasse(classe: Classe) {
    this.selectedClasse = classe;
    this.searchTerm = ''; // Reset search on new class
    this.currentPage = 1;
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
      (student.cne && student.cne.toLowerCase().includes(term)) ||
      (student.email && student.email.toLowerCase().includes(term))
    );
  }

  get paginatedStudents(): Student[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredStudents.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  exportList() {
    alert('Fonctionnalité d\'export (Excel/PDF) en cours de développement.');
  }
}
