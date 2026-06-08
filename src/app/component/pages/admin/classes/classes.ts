import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService, Filiere } from '../../../../core/services/api.service';
import { SearchService } from '../../../../core/services/search.service';

@Component({
  selector: 'app-admin-classes',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './classes.html',
  styleUrls: ['./classes.css']
})
export class AdminClassesComponent implements OnInit {
  
  searchTerm = '';
  selectedFilter = 'all';
  showModal = false;
  editingId: number | null = null;
  toastMessage = '';
  showToast = false;
  isLoading = false;
  isSaving = false;

  // Modèle de classe
  newClass = {
    nom: '',
    filiere_id: null as number | null,
    teachers: [] as number[]
  };

  classes: any[] = [];
  rawClasses: any[] = [];
  filieres: Filiere[] = [];
  teachersList: any[] = [];

  constructor(private api: ApiService, private searchService: SearchService) {}

  ngOnInit() {
    this.searchService.currentSearch$.subscribe((term: string) => {
      this.searchTerm = term;
    });
    this.loadClasses();
    this.loadFilieres();
    this.loadTeachers();
  }

  loadClasses() {
    this.isLoading = true;
    this.api.getAdminClasses().subscribe({
      next: (classes) => {
        this.rawClasses = classes;
        this.classes = classes.map((c: any) => ({
          id: c.id,
          nom: c.nom,
          filiere_id: c.filiere_id,
          filiere: c.filiere ? c.filiere.nom : '',
          studentsCount: c.etudiants ? c.etudiants.length : 0,
          teachers: c.enseignants ? Array.from(new Set(c.enseignants.map((e: any) => e.user ? `${e.user.nom} ${e.user.prenom}` : '').filter((name: string) => !!name.trim()))) : []
        }));
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.triggerToast(error.message || 'Impossible de charger les classes.');
      }
    });
  }

  loadFilieres() {
    this.api.getFilieres().subscribe({
      next: (filieres) => {
        this.filieres = filieres;
      },
      error: (error) => {
        this.triggerToast(error.message || 'Impossible de charger les filières.');
      }
    });
  }

  loadTeachers() {
    this.api.getAdminEnseignants().subscribe({
      next: (users) => {
        this.teachersList = users.map((user: any) => ({
          id: user.id,
          nom: user.prenom && user.nom ? `${user.prenom} ${user.nom}` : user.nom || ''
        }));
      },
      error: () => {}
    });
  }

  get filteredClasses() {
    return this.classes.filter(c => {
      const matchSearch = c.nom.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchFilter = this.selectedFilter === 'all' || c.filiere_id == this.selectedFilter;
      return matchSearch && matchFilter;
    });
  }

  openModal(cls?: any) {
    if (cls) {
      this.editingId = cls.id;
      this.newClass = { 
        nom: cls.nom, 
        filiere_id: cls.filiere_id,
        teachers: []
      };
      
      const originalClass = this.rawClasses.find((c: any) => c.id === cls.id);
      if (originalClass && originalClass.enseignants) {
        this.newClass.teachers = originalClass.enseignants.map((e: any) => e.id_enseignant);
      }
    } else {
      this.editingId = null;
      this.newClass = { nom: '', filiere_id: null, teachers: [] };
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  toggleTeacher(teacherId: number) {
    const idx = this.newClass.teachers.indexOf(teacherId);
    if (idx > -1) {
      this.newClass.teachers.splice(idx, 1);
    } else {
      this.newClass.teachers.push(teacherId);
    }
  }

  isTeacherSelected(teacherId: number): boolean {
    return this.newClass.teachers.includes(teacherId);
  }

  saveClass() {
    if (!this.newClass.nom || !this.newClass.filiere_id) {
      return;
    }
    
    const isEdit = !!this.editingId;
    const tempId = this.editingId || Date.now();
    const selectedFiliere = this.filieres.find(f => f.id == this.newClass.filiere_id);
    const filiereName = selectedFiliere ? selectedFiliere.nom : '';

    const optimisticTeacherNames = this.newClass.teachers.map(tid => {
      const t = this.teachersList.find(teacher => teacher.id == tid);
      return t ? t.nom : '';
    }).filter(Boolean);

    const optimisticClass = {
      id: tempId,
      nom: this.newClass.nom,
      filiere_id: this.newClass.filiere_id,
      filiere: filiereName,
      studentsCount: isEdit ? (this.classes.find(c => c.id === this.editingId)?.studentsCount || 0) : 0,
      teachers: Array.from(new Set(optimisticTeacherNames))
    };

    const previousClasses = [...this.classes];

    if (isEdit) {
      const idx = this.classes.findIndex(c => c.id === this.editingId);
      if (idx > -1) {
        this.classes[idx] = optimisticClass;
      }
    } else {
      this.classes.unshift(optimisticClass);
    }

    this.closeModal();
    this.triggerToast(isEdit ? 'Classe mise à jour.' : 'Nouvelle classe créée.');

    const payload = {
      nom: this.newClass.nom,
      filiere_id: Number(this.newClass.filiere_id),
      enseignant_ids: this.newClass.teachers
    };

    const request$ = isEdit
      ? this.api.updateAdminClass(this.editingId!, payload)
      : this.api.createAdminClass(payload);

    request$.subscribe({
      next: () => {
        this.loadClasses();
      },
      error: (error) => {
        this.classes = previousClasses;
        this.triggerToast(error.message || 'Erreur lors de l\'enregistrement de la classe.');
      }
    });
  }

  deleteClass(id: number) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette classe ?")) {
      const previousClasses = [...this.classes];
      this.classes = this.classes.filter(c => c.id !== id);

      this.api.deleteAdminClass(id).subscribe({
        next: () => {
          this.triggerToast('Classe supprimée.');
          this.loadClasses();
        },
        error: (error) => {
          this.classes = previousClasses;
          this.triggerToast(error.message || 'Erreur lors de la suppression de la classe.');
        }
      });
    }
  }

  triggerToast(msg: string) {
    this.toastMessage = msg;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

}
