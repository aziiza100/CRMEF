import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ApiService, Filiere, Formation } from '../../../../core/services/api.service';
import { SearchService } from '../../../../core/services/search.service';
import { PaginationComponent } from '../../../shared/pagination/pagination';
import { ToastService } from '../../../../core/services/toast.service';

declare var XLSX: any;

@Component({
  selector: 'app-admin-filieres',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PaginationComponent],
  templateUrl: './filieres.html',
  styleUrls: ['./filieres.css']
})
export class AdminFilieresComponent implements OnInit {
  searchTerm = '';
  showModal = false;
  editingId: number | null = null;
  isLoading = false;
  isSaving = false;

  currentPage = 1;
  pageSize = 10;

  @ViewChild('excelInput') excelInput?: ElementRef<HTMLInputElement>;

  // Excel bulk import properties
  showImportResultModal = false;
  importErrors: string[] = [];
  importSuccessMessage = '';

  newFiliere: Partial<Filiere> & { formation_ids?: number[] } = {
    nom: '',
    description: '',
    formation_ids: []
  };

  filieres: Filiere[] = [];
  formations: Formation[] = [];

  constructor(
    private api: ApiService, 
    private router: Router, 
    private searchService: SearchService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.searchService.currentSearch$.subscribe((term: string) => {
      this.searchTerm = term;
      this.currentPage = 1;
    });
    this.loadFilieres();
    this.loadFormations();
  }

  get filteredFilieres() {
    return this.filieres.filter(f => {
      return f.nom?.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }

  get paginatedFilieres() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredFilieres.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChange(page: number) {
    this.currentPage = page;
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
        this.toast.error(this.toast.getErrorMessage(error, 'Impossible de charger les filières.'));
      }
    });
  }

  loadFormations(): void {
    this.api.getFormations().subscribe({
      next: (formations) => this.formations = formations,
      error: (error) => this.toast.error(this.toast.getErrorMessage(error, 'Impossible de charger les formations.'))
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
        this.toast.success(wasEditing ? 'La filière a été mise à jour avec succès.' : 'La filière a été créée avec succès.');
      },
      error: (error) => {
        this.isSaving = false;
        this.toast.error(this.toast.getErrorMessage(error, `Impossible de ${wasEditing ? 'mettre à jour' : 'créer'} la filière.`));
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
          this.toast.success('La filière a été supprimée avec succès.');
          this.loadFilieres();
        },
        error: (error) => this.toast.error(this.toast.getErrorMessage(error, 'Impossible de supprimer la filière.'))
      });
    }
  }

  trackByFiliere(index: number, filiere: Filiere) {
    return filiere.id;
  }

  triggerExcelUpload() {
    if (this.excelInput?.nativeElement) {
      this.excelInput.nativeElement.value = '';
      this.excelInput.nativeElement.click();
    }
  }

  onExcelFileSelected(event: any) {
    const file = event.target.files?.[0] as File | undefined;
    if (!file) {
      return;
    }

    if (typeof XLSX === 'undefined') {
      alert("Erreur : La bibliothèque d'importation SheetJS n'est pas chargée. Veuillez patienter ou vérifier votre connexion Internet.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (rawRows.length === 0) {
          alert("Le fichier Excel est vide.");
          return;
        }

        const normalizeKey = (key: string): string => {
          return key
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
        };

        const mapExcelRow = (row: any) => {
          const mapped: any = {};
          for (const key of Object.keys(row)) {
            const norm = normalizeKey(key);
            if (norm === 'nom' || norm === 'nom filiere' || norm === 'filiere') mapped.nom = String(row[key]);
            else if (norm === 'niveau') mapped.niveau = String(row[key]);
            else if (norm === 'description' || norm === 'desc') mapped.description = String(row[key]);
            else if (norm === 'formations' || norm === 'formation') mapped.formations = String(row[key]);
          }
          return mapped;
        };

        const mappedRows = rawRows.map((row, idx) => {
          const mapped = mapExcelRow(row);
          mapped._rowIndex = idx + 2;
          return mapped;
        });

        // Client side validation
        const clientErrors: string[] = [];
        for (const row of mappedRows) {
          const line = row._rowIndex;
          if (!row.nom) clientErrors.push(`Ligne ${line} : Le nom de la filière est manquant.`);
        }

        if (clientErrors.length > 0) {
          this.importErrors = clientErrors;
          this.importSuccessMessage = '';
          this.showImportResultModal = true;
          if (this.excelInput?.nativeElement) {
            this.excelInput.nativeElement.value = '';
          }
          return;
        }

        const payload = mappedRows.map(row => {
          const { _rowIndex, ...rest } = row;
          return rest;
        });

        this.api.importAdminFilieres(payload).subscribe({
          next: (res) => {
            this.importErrors = [];
            this.importSuccessMessage = res.message || 'Importation réussie.';
            this.showImportResultModal = true;
            this.loadFilieres();
            if (this.excelInput?.nativeElement) this.excelInput.nativeElement.value = '';
          },
          error: (err) => {
            this.importErrors = err.error?.errors || [err.message || 'Erreur lors de l\'importation.'];
            this.importSuccessMessage = '';
            this.showImportResultModal = true;
            if (this.excelInput?.nativeElement) this.excelInput.nativeElement.value = '';
          }
        });
      } catch (err) {
        alert("Erreur lors de la lecture du fichier Excel. Assurez-vous que le format est valide.");
        if (this.excelInput?.nativeElement) this.excelInput.nativeElement.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  }

  closeImportResultModal() {
    this.showImportResultModal = false;
    this.importErrors = [];
  }
}
