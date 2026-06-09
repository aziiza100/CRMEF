import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';
import { ApiService, Filiere, Module } from '../../../../core/services/api.service';
import { SearchService } from '../../../../core/services/search.service';

@Component({
  selector: 'app-admin-modules',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './modules.html',
  styleUrls: ['./modules.css']
})
export class AdminModulesComponent implements OnInit {
  modules: Module[] = [];
  filieres: Filiere[] = [];
  classes: any[] = [];
  enseignants: any[] = [];

  searchTerm = '';
  selectedClasseId: number | null = null;
  showToast = false;
  toastMessage = '';
  isLoading = false;
  isSaving = false;
  showModal = false;
  editingModuleId: number | null = null;

  newModule = {
    nom: '',
    masse_horraire: 0,
    filiere_id: null as number | null,
    classe_id: null as number | null,
    enseignant_id: null as number | null,
  };

  constructor(private api: ApiService, private searchService: SearchService) {}

  ngOnInit(): void {
    this.searchService.currentSearch$.subscribe((term: string) => {
      this.searchTerm = term;
    });
    this.loadModules();
    this.loadFilieres();
    this.loadEnseignants();
    this.loadClasses();
  }

  get filteredClasses() {
    return this.classes.filter(classe => (
      // match direct filiere_id or nested filiere object, use loose equality to handle number/string
      (classe.filiere_id != null && classe.filiere_id == this.newModule.filiere_id) ||
      (classe.filiere && classe.filiere.id != null && classe.filiere.id == this.newModule.filiere_id)
    ));
  }

  get filteredModules() {
    const term = this.searchTerm.toLowerCase();
    return this.modules.filter(module => {
      const matchesTerm = module.nom.toLowerCase().includes(term)
        || module.filieres?.some(f => f.nom.toLowerCase().includes(term));

      const matchesClasse = this.selectedClasseId == null
        || module.classes?.some(classe => classe.id === this.selectedClasseId);

      return matchesTerm && matchesClasse;
    });
  }

  getClasseName(module: Module): string {
    const classe = module.classes?.[0];
    return classe?.nom ?? '-';
  }

  getModuleEnseignantName(module: Module): string {
    const enseignantId = module.classes?.[0]?.pivot?.id_enseignant;
    return this.getEnseignantNom(enseignantId);
  }

  loadModules(): void {
    this.isLoading = true;
    this.api.getModules().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (modules) => this.modules = modules,
      error: (error) => this.triggerToast(error?.message || 'Impossible de charger les modules.')
    });
  }

  loadFilieres(): void {
    this.api.getFilieres().subscribe({
      next: (filieres) => this.filieres = filieres,
      error: (error) => this.triggerToast(error?.message || 'Impossible de charger les fili�res.')
    });
  }

  loadEnseignants(): void {
    this.api.getAdminEnseignants().subscribe({
      next: (enseignants) => this.enseignants = enseignants,
      error: (error) => this.triggerToast(error?.message || 'Impossible de charger les enseignants.')
    });
  }

  loadClasses(): void {
    this.api.getAdminClasses().subscribe({
      next: (classes) => this.classes = classes,
      error: (error) => this.triggerToast(error?.message || 'Impossible de charger les classes.')
    });
  }

  openModal(): void {
    this.resetForm();
    this.editingModuleId = null;
    this.showModal = true;
  }

  openEditModal(module: Module): void {
    this.editingModuleId = module.id ?? null;
    this.newModule.nom = module.nom;
    this.newModule.masse_horraire = module.masse_horraire ?? 0;
    this.newModule.filiere_id = module.filieres && module.filieres.length ? (module.filieres[0].id ?? null) : null;
    const classe = module.classes && module.classes.length ? module.classes[0] : null;
    this.newModule.classe_id = classe ? (classe.id ?? null) : null;
    this.newModule.enseignant_id = classe && classe.pivot ? (classe.pivot.id_enseignant ?? null) : null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  resetForm(): void {
    this.newModule = { nom: '', masse_horraire: 0, filiere_id: null, classe_id: null, enseignant_id: null };
  }

  saveModule(): void {
    if (!this.newModule.nom || !this.newModule.masse_horraire || !this.newModule.filiere_id || !this.newModule.enseignant_id || !this.newModule.classe_id) {
      this.triggerToast('Veuillez remplir tous les champs requis.');
      return;
    }
    this.isSaving = true;

    const payloadBase: any = {
      nom: this.newModule.nom,
      masse_horraire: this.newModule.masse_horraire,
      filiere_id: this.newModule.filiere_id,
      classe_id: this.newModule.classe_id,
      enseignant_id: this.newModule.enseignant_id,
    };

    if (this.editingModuleId) {
      this.api.updateModule(this.editingModuleId, payloadBase).pipe(finalize(() => this.isSaving = false)).subscribe({
        next: () => {
          this.loadModules();
          this.closeModal();
          this.triggerToast('Module mis à jour.');
        },
        error: (err) => this.triggerToast(err?.message || 'Impossible de mettre à jour le module.')
      });
      return;
    }

    // Create new module for selected filiere
    const payload: any = {
      nom: this.newModule.nom,
      masse_horraire: this.newModule.masse_horraire,
      enseignant_id: this.newModule.enseignant_id
    };
    if (this.newModule.classe_id != null) {
      payload.classe_id = this.newModule.classe_id;
    }

    this.api.createModule(this.newModule.filiere_id!, payload).pipe(
      finalize(() => this.isSaving = false)
    ).subscribe({
      next: (response) => {
        this.loadModules();
        this.closeModal();
        this.triggerToast('Module créé avec succès.');
      },
      error: (error) => this.triggerToast(error?.message || 'Impossible de créer le module.')
    });
  }

  deleteModule(id: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) {
      return;
    }

    this.api.deleteModule(id).subscribe({
      next: () => {
        this.modules = this.modules.filter(module => module.id !== id);
        this.triggerToast('Module supprim� avec succ�s.');
      },
      error: (error) => this.triggerToast(error?.message || 'Impossible de supprimer le module.')
    });
  }

  getFiliereNames(module: Module): string {
    return module.filieres?.map(f => f.nom).join(', ') ?? '-';
  }

  getEnseignantNom(enseignantId: number | null | undefined): string {
    const enseignant = this.enseignants.find(e =>
      e.id === enseignantId
      || e.id_enseignant === enseignantId
      || (e.enseignant && e.enseignant.id_enseignant === enseignantId)
    );
    if (!enseignant) {
      return '-';
    }
    return [enseignant.nom, enseignant.prenom].filter(Boolean).join(' ');
  }

  triggerToast(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }
}
