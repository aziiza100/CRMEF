import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ApiService, Filiere, Formation } from '../../../../core/services/api.service';

@Component({
  selector: 'app-admin-filieres',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './filieres.html',
  styleUrls: ['./filieres.css']
})
export class AdminFilieresComponent implements OnInit {
  searchTerm = '';
  showModal = false;
  editingId: number | null = null;
  toastMessage = '';
  showToast = false;
  isLoading = false;
  isSaving = false;

  newFiliere: Partial<Filiere> & { formation_ids?: number[] } = {
    nom: '',
    description: '',
    formation_ids: []
  };

  filieres: Filiere[] = [];
  formations: Formation[] = [];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadFilieres();
    this.loadFormations();
  }

  get filteredFilieres() {
    return this.filieres.filter(f => {
      return f.nom?.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }

  loadFilieres(): void {
    this.isLoading = true;
    this.api.getFilieres().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (filieres) => this.filieres = filieres,
      error: (error) => {
        // ensure loading indicator is cleared
        this.isLoading = false;
        if (error && error.status === 401) {
          // unauthenticated -> clear token and redirect to login
          localStorage.removeItem('crmef_admin_token');
          this.router.navigate(['/login']);
          return;
        }
        this.triggerToast(error?.message || 'Impossible de charger les filières.');
      }
    });
  }

  loadFormations(): void {
    this.api.getFormations().subscribe({
      next: (formations) => this.formations = formations,
      error: (error) => this.triggerToast(error.message || 'Impossible de charger les formations.')
    });
  }

  openModal(filiere?: Filiere) {
    if (filiere) {
      this.editingId = filiere.id ?? null;
      this.newFiliere = {
        nom: filiere.nom,
        description: filiere.description ?? '',
        formation_ids: filiere.formations?.map(formation => formation.id!).filter(Boolean) ?? []
      };
    } else {
      this.editingId = null;
      this.newFiliere = { nom: '', description: '', formation_ids: [] };
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.isSaving = false;
    this.editingId = null;
    this.newFiliere = { nom: '', description: '', formation_ids: [] };
  }

  saveFiliere() {
    const payload: Partial<Filiere> & { formation_ids?: number[] } = {
      nom: this.newFiliere.nom ?? '',
      description: this.newFiliere.description ?? ''
    };

    this.isSaving = true;

    const request$ = this.editingId
      ? this.api.updateFiliere(this.editingId, { ...payload, formation_ids: this.newFiliere.formation_ids ?? [] })
      : this.api.createFiliere({ ...payload, formation_ids: this.newFiliere.formation_ids ?? [] });

    const wasEditing = !!this.editingId;

    request$.pipe(
      finalize(() => this.isSaving = false)
    ).subscribe({
      next: (filiere) => {
        if (wasEditing) {
          const index = this.filieres.findIndex(f => f.id === this.editingId);
          if (index !== -1) {
            this.filieres[index] = filiere;
          }
        } else {
          this.filieres.unshift(filiere);
        }
        this.closeModal();
        this.triggerToast(wasEditing ? 'Filière mise à jour avec succès.' : 'Filière créée avec succès.');
      },
      error: (error) => {
        this.isSaving = false;
        this.triggerToast(error.message || `Impossible de ${wasEditing ? 'mettre à jour' : 'créer'} la filière.`);
      }
    });
  }

  toggleFormationSelection(formationId: number): void {
    if (!this.newFiliere.formation_ids) {
      this.newFiliere.formation_ids = [];
    }

    const idx = this.newFiliere.formation_ids.indexOf(formationId);
    if (idx >= 0) {
      this.newFiliere.formation_ids.splice(idx, 1);
    } else {
      this.newFiliere.formation_ids.push(formationId);
    }
  }

  isFormationSelected(formationId: number): boolean {
    return this.newFiliere.formation_ids?.includes(formationId) ?? false;
  }

  deleteFiliere(id: number) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette filière ?")) {
      const idToRemove = Number(id);
      this.api.deleteFiliere(idToRemove).subscribe({
        next: () => {
          this.filieres = this.filieres.filter(f => Number(f.id) !== idToRemove);
          this.triggerToast('Filière supprimée avec succès.');
          this.loadFilieres();
        },
        error: (error) => this.triggerToast(error.message || 'Impossible de supprimer la filière.')
      });
    }
  }

  trackByFiliere(index: number, filiere: Filiere) {
    return filiere.id;
  }

  triggerToast(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
