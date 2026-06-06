import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ApiService, Formation, Filiere } from '../../../../core/services/api.service';

@Component({
  selector: 'app-admin-formations',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="admin-formations-page">
      <div class="page-header">
        <h1 class="page-title">Gestion des Formations</h1>
        <p class="page-desc">Créez, modifiez ou supprimez des formations et associez-les aux filières.</p>
      </div>

      <div class="toast-notification success-toast" [class.show]="showToast">
        <i class="bi bi-check-circle"></i>
        <span>{{ toastMessage }}</span>
      </div>

      <div class="toolbar">
        <div class="toolbar-actions">
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input type="text" [(ngModel)]="searchTerm" placeholder="Rechercher une formation..." />
          </div>
        </div>
        <button class="btn-primary" (click)="openModal()" [disabled]="isLoading">
          <i class="bi bi-plus-lg"></i> Ajouter une formation
        </button>
      </div>

      <div class="table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Durée</th>
              <th>Description</th>
              <th>Condition d'accès</th>
              <th>Filières</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="isLoading">
              <td colspan="6">Chargement des formations...</td>
            </tr>
            <tr *ngFor="let formation of filteredFormations; trackBy: trackByFormation">
              <td class="fw-bold">{{ formation.type }}</td>
              <td>{{ formation.duree }}</td>
              <td>{{ formation.description }}</td>
              <td>{{ formation.condition_acces }}</td>
              <td>
                <span *ngIf="formation.filieres?.length; else none">
                  {{ formation.filieres ? formation.filieres.map(f => f.nom).join(', ') : '' }}
                </span>
                <ng-template #none>—</ng-template>
              </td>
              <td class="text-end">
                <button class="action-icon" title="Modifier" (click)="openModal(formation)">
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="action-icon danger" title="Supprimer" (click)="deleteFormation(formation.id!)">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </td>
            </tr>
            <tr *ngIf="!isLoading && filteredFormations.length === 0">
              <td colspan="6">Aucune formation trouvée.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="showModal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingId ? 'Modifier la formation' : 'Nouvelle formation' }}</h3>
            <button class="close-btn" (click)="closeModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Type</label>
              <input type="text" class="form-control" [(ngModel)]="newFormation.type" placeholder="Ex: Primaire, Secondaire" />
            </div>
            <div class="form-group">
              <label>Durée</label>
              <input type="text" class="form-control" [(ngModel)]="newFormation.duree" placeholder="Ex: 2 ans" />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea rows="3" class="form-control" [(ngModel)]="newFormation.description"></textarea>
            </div>
            <div class="form-group">
              <label>Condition d'accès</label>
              <textarea rows="2" class="form-control" [(ngModel)]="newFormation.condition_acces"></textarea>
            </div>
            <div class="form-group">
              <label>Filières associées</label>
              <div class="checkbox-grid">
                <label *ngFor="let filiere of filieres" class="checkbox-item">
                  <input type="checkbox" [checked]="isFiliereSelected(filiere.id!)" (change)="toggleFiliereSelection(filiere.id!)" />
                  {{ filiere.nom }}
                </label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" type="button" (click)="closeModal()">Annuler</button>
            <button class="btn-primary" type="button" (click)="saveFormation()" [disabled]="isSaving">
              {{ editingId ? 'Enregistrer' : 'Créer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-formations-page {
        animation: fadeIn 0.4s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .page-header {
        margin-bottom: 25px;
      }

      .page-title {
        font-size: 28px;
        font-weight: 800;
        color: #0f172a;
        margin: 0 0 5px 0;
      }

      .page-desc {
        font-size: 15px;
        color: #64748b;
        margin: 0;
      }

      .toast-notification {
        position: fixed;
        top: 20px;
        right: -300px;
        background: #fff;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 15px;
        font-weight: 600;
        color: #1e293b;
        z-index: 9999;
        transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .toast-notification.show { right: 20px; }
      .success-toast { border-left: 4px solid #10b981; }
      .success-toast i { color: #10b981; font-size: 20px; }

      .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #fff;
        padding: 15px 25px;
        border-radius: 16px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        margin-bottom: 25px;
        flex-wrap: wrap;
        gap: 20px;
      }

      .toolbar-actions {
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .search-box {
        position: relative;
        width: 250px;
      }

      .search-box i {
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
        color: #94a3b8;
      }

      .search-box input {
        width: 100%;
        padding: 10px 15px 10px 40px;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        background: #f8fafc;
        outline: none;
        transition: all 0.3s;
      }

      .search-box input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        background: #fff;
      }

      .btn-primary {
        background: #3b82f6;
        color: #fff;
        border: none;
        padding: 10px 20px;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s;
      }

      .btn-primary:hover { background: #2563eb; }
      .btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }

      .table-container {
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        overflow-x: auto;
      }

      .admin-table {
        width: 100%;
        border-collapse: collapse;
      }

      .admin-table th {
        background: #f8fafc;
        padding: 16px 25px;
        text-align: left;
        font-size: 13px;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 2px solid #e2e8f0;
      }

      .admin-table td {
        padding: 16px 25px;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: middle;
      }

      .admin-table tbody tr:hover { background: #f8fafc; }

      .fw-bold { font-weight: 800; color: #1e293b; }
      .fs-5 { font-size: 1.1rem; }
      .text-end { text-align: right; }

      .action-icon {
        background: transparent;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        color: #64748b;
        cursor: pointer;
        transition: all 0.3s;
      }

      .action-icon:hover { background: #f1f5f9; color: #3b82f6; }
      .action-icon.danger:hover { background: #fee2e2; color: #ef4444; }

      .modal-overlay {
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.5);
        backdrop-filter: blur(4px);
        z-index: 2000;
        display: flex; align-items: center; justify-content: center;
        animation: fadeIn 0.3s;
      }

      .modal-content {
        background: #fff;
        width: 100%;
        max-width: 650px;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        overflow: hidden;
      }

      @keyframes slideUp {
        from { opacity: 0; transform: translateY(40px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      .modal-header {
        padding: 20px 25px; border-bottom: 1px solid #f1f5f9;
        display: flex; justify-content: space-between; align-items: center;
      }

      .modal-header h3 { margin: 0; font-size: 18px; font-weight: 700; color: #1e293b; }
      .close-btn { background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; }
      .close-btn:hover { color: #ef4444; }

      .modal-body { padding: 25px; }
      .form-group { margin-bottom: 20px; }
      .form-group label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 8px; }
      .form-control, .form-select, textarea {
        width: 100%; padding: 12px 15px; border: 1px solid #e2e8f0;
        border-radius: 10px; font-size: 14px; outline: none; transition: all 0.3s;
      }

      .form-control:focus, .form-select:focus, textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

      .checkbox-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 10px;
      }

      .checkbox-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        cursor: pointer;
      }

      .checkbox-item input { accent-color: #2563eb; }

      .modal-footer {
        padding: 20px 25px; background: #f8fafc; border-top: 1px solid #f1f5f9;
        display: flex; justify-content: flex-end; gap: 15px;
      }

      .btn-cancel {
        background: #fff; border: 1px solid #e2e8f0; color: #64748b;
        padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer;
      }

      .btn-cancel:hover { background: #f1f5f9; }
    `
  ]
})
export class AdminFormationsComponent implements OnInit {
  searchTerm = '';
  showModal = false;
  editingId: number | null = null;
  toastMessage = '';
  showToast = false;
  isLoading = false;
  isSaving = false;

  newFormation: Partial<Formation> & { filiere_ids?: number[] } = {
    type: '',
    duree: '',
    description: '',
    condition_acces: '',
    filiere_ids: []
  };

  formations: Formation[] = [];
  filieres: Filiere[] = [];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadFormations();
    this.loadFilieres();
  }

  get filteredFormations() {
    return this.formations.filter(f => {
      const search = this.searchTerm.toLowerCase();
      return f.type?.toLowerCase().includes(search) ||
        (f.description?.toLowerCase().includes(search) ?? false) ||
        (f.condition_acces?.toLowerCase().includes(search) ?? false);
    });
  }

  loadFormations(): void {
    this.isLoading = true;
    this.api.getFormations().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (formations) => this.formations = formations,
      error: (error) => {
        this.isLoading = false;
        if (error && error.status === 401) {
          localStorage.removeItem('crmef_admin_token');
          this.router.navigate(['/login']);
          return;
        }
        this.triggerToast(error?.message || 'Impossible de charger les formations.');
      }
    });
  }

  loadFilieres(): void {
    this.api.getFilieres().subscribe({
      next: (filieres) => this.filieres = filieres,
      error: (error) => this.triggerToast(error.message || 'Impossible de charger les filières.')
    });
  }

  openModal(formation?: Formation) {
    if (formation) {
      this.editingId = formation.id ?? null;
      this.newFormation = {
        type: formation.type ?? '',
        duree: formation.duree ?? '',
        description: formation.description ?? '',
        condition_acces: formation.condition_acces ?? '',
        filiere_ids: formation.filieres?.map(f => f.id!).filter(Boolean) ?? []
      };
    } else {
      this.editingId = null;
      this.newFormation = { type: '', duree: '', description: '', condition_acces: '', filiere_ids: [] };
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.isSaving = false;
    this.editingId = null;
    this.newFormation = { type: '', duree: '', description: '', condition_acces: '', filiere_ids: [] };
  }

  saveFormation() {
    const payload: Partial<Formation> & { filiere_ids?: number[] } = {
      type: this.newFormation.type ?? '',
      duree: this.newFormation.duree ?? '',
      description: this.newFormation.description ?? '',
      condition_acces: this.newFormation.condition_acces ?? ''
    };

    const request$ = this.editingId
      ? this.api.updateFormation(this.editingId, { ...payload, filiere_ids: this.newFormation.filiere_ids ?? [] })
      : this.api.createFormation({ ...payload, filiere_ids: this.newFormation.filiere_ids ?? [] });

    const wasEditing = !!this.editingId;
    this.isSaving = true;

    request$.pipe(
      finalize(() => this.isSaving = false)
    ).subscribe({
      next: (formation) => {
        if (wasEditing) {
          const index = this.formations.findIndex(f => f.id === this.editingId);
          if (index !== -1) {
            this.formations[index] = formation;
          }
        } else {
          this.formations.unshift(formation);
        }
        this.closeModal();
        this.triggerToast(wasEditing ? 'Formation mise à jour avec succès.' : 'Formation créée avec succès.');
      },
      error: (error) => {
        this.isSaving = false;
        this.triggerToast(error.message || `Impossible de ${wasEditing ? 'mettre à jour' : 'créer'} la formation.`);
      }
    });
  }

  toggleFiliereSelection(filiereId: number): void {
    if (!this.newFormation.filiere_ids) {
      this.newFormation.filiere_ids = [];
    }
    const index = this.newFormation.filiere_ids.indexOf(filiereId);
    if (index >= 0) {
      this.newFormation.filiere_ids.splice(index, 1);
    } else {
      this.newFormation.filiere_ids.push(filiereId);
    }
  }

  isFiliereSelected(filiereId: number): boolean {
    return this.newFormation.filiere_ids?.includes(filiereId) ?? false;
  }

  deleteFormation(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      const idToRemove = Number(id);
      this.api.deleteFormation(idToRemove).subscribe({
        next: () => {
          this.formations = this.formations.filter(f => Number(f.id) !== idToRemove);
          this.triggerToast('Formation supprimée avec succès.');
          this.loadFormations();
        },
        error: (error) => this.triggerToast(error.message || 'Impossible de supprimer la formation.')
      });
    }
  }

  trackByFormation(index: number, formation: Formation) {
    return formation.id;
  }

  triggerToast(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
