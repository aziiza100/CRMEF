import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService, Filiere } from '../../../../core/services/api.service';
import { SearchService } from '../../../../core/services/search.service';
import { PaginationComponent } from '../../../shared/pagination/pagination';
import { ToastService } from '../../../../core/services/toast.service';

declare var XLSX: any;

@Component({
  selector: 'app-admin-classes',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PaginationComponent],
  templateUrl: './classes.html',
  styleUrls: ['./classes.css']
})
export class AdminClassesComponent implements OnInit {
  
  searchTerm = '';
  selectedFilter = 'all';
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
  showStudentsModal = false;
  selectedStudents: any[] = [];
  selectedClassName = '';
  selectedStudent: any = null;
  showStudentDetail = false;
  studentFilter = '';

  constructor(
    private api: ApiService, 
    private searchService: SearchService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.searchService.currentSearch$.subscribe((term: string) => {
      this.searchTerm = term;
      this.currentPage = 1;
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
        this.toast.error(this.toast.getErrorMessage(error, 'Impossible de charger les classes.'));
      }
    });
  }

  loadFilieres() {
    this.api.getFilieres().subscribe({
      next: (filieres) => {
        this.filieres = filieres;
      },
      error: (error) => {
        this.toast.error(this.toast.getErrorMessage(error, 'Impossible de charger les filières.'));
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

  get paginatedClasses() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredClasses.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChange(page: number) {
    this.currentPage = page;
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

  openStudentsModal(cls: any) {
    const originalClass = this.rawClasses.find((c: any) => c.id === cls.id);
    if (originalClass && originalClass.etudiants && originalClass.etudiants.length > 0) {
      this.selectedStudents = originalClass.etudiants.map((u: any) => {
        const user = u.user || u;
        return {
          id: u.id || user.id,
          prenom: u.prenom || user.prenom || '',
          nom: u.nom || user.nom || '',
          email: u.email || user.email || '',
          cin_user: user.cin || user.cin || '',
          cne: u.cne || (u.etudiant ? u.etudiant.cne : '') || '',
          matricule: u.matricule || (u.etudiant ? u.etudiant.matricule : '') || '',
          telephone: u.tele || user.tele || user.telephone || '',
          avatar: user.image_base64 || user.avatar || this.getStudentAvatarUrl(user),
          role: user.role || null,
          created_at: user.created_at || u.created_at || null,
          raw: u
        };
      });
      this.selectedClassName = cls.nom;
      this.selectedStudent = null;
      this.showStudentDetail = false;
      this.showStudentsModal = true;
      return;
    }

    // Fallback: fetch all students and filter by class
    this.api.getAdminStudents().subscribe({
      next: (users) => {
        const students = users.filter((u: any) => {
          const c = u.etudiant?.classe;
          return (c && (c.id === cls.id || c.nom === cls.nom));
        }).map((u: any) => {
          const user = u.user || u;
          return {
            id: u.id,
            prenom: user.prenom || '',
            nom: user.nom || '',
            email: user.email || user.email || '',
            cin_user: user.cin || '',
            cne: u.etudiant?.cne || '',
            matricule: u.etudiant?.matricule || u.matricule || '',
            telephone: user.tele || u.tele || '',
            avatar: user.image_base64 || user.avatar || this.getStudentAvatarUrl(user),
            role: user.role || null,
            created_at: user.created_at || u.created_at || null,
            raw: u
          };
        });
        this.selectedStudents = students;
        this.selectedClassName = cls.nom;
        this.selectedStudent = null;
        this.showStudentDetail = false;
        this.showStudentsModal = true;
      },
      error: () => {
        this.selectedStudents = [];
        this.selectedClassName = cls.nom;
        this.showStudentsModal = true;
      }
    });
  }

  showStudentDetailFor(s: any) {
    this.selectedStudent = s;
    this.showStudentDetail = true;
  }

  backToStudentsList() {
    this.showStudentDetail = false;
    this.selectedStudent = null;
  }

  closeStudentsModal() {
    this.showStudentsModal = false;
    this.selectedStudents = [];
    this.selectedClassName = '';
    this.selectedStudent = null;
    this.showStudentDetail = false;
  }

  getStudentAvatarUrl(user: any) {
    const firstName = encodeURIComponent(user.prenom || '');
    const lastName = encodeURIComponent(user.nom || '');
    const name = `${firstName}+${lastName}`.trim();
    return `https://ui-avatars.com/api/?name=${name || 'Etudiant'}&background=0f172a&color=fff&size=128`;
  }

  get filteredStudents() {
    const filter = this.studentFilter.trim().toLowerCase();
    if (!filter) {
      return this.selectedStudents;
    }
    return this.selectedStudents.filter((s: any) => {
      return [
        s.prenom,
        s.nom,
        s.email,
        s.cne,
        s.cin_user
      ].some((value: any) => value && value.toString().toLowerCase().includes(filter));
    });
  }

  getInitials(s: any) {
    const n = (s.prenom || '') + ' ' + (s.nom || '');
    return n.split(' ').map((p: string) => p.charAt(0)).join('').substring(0,2).toUpperCase();
  }

  viewStudent(s: any) {
    // placeholder: could open a detailed student view
    this.toast.info(`Ouvrir profil : ${s.prenom || ''} ${s.nom || ''}`);
  }

  editStudent(s: any) {
    // placeholder: could navigate to student edit form
    this.toast.info(`Modifier étudiant : ${s.prenom || ''} ${s.nom || ''}`);
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
    
    this.isSaving = true;
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
    this.toast.success(isEdit ? 'La classe a été mise à jour avec succès.' : 'La classe a été créée avec succès.');

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
        this.isSaving = false;
        this.loadClasses();
      },
      error: (error) => {
        this.isSaving = false;
        this.classes = previousClasses;
        this.toast.error(this.toast.getErrorMessage(error, 'Erreur lors de l\'enregistrement de la classe.'));
      }
    });
  }

  deleteClass(id: number) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette classe ?")) {
      const previousClasses = [...this.classes];
      this.classes = this.classes.filter(c => c.id !== id);

      this.api.deleteAdminClass(id).subscribe({
        next: () => {
          this.toast.success('La classe a été supprimée avec succès.');
          this.loadClasses();
        },
        error: (error) => {
          this.classes = previousClasses;
          this.toast.error(this.toast.getErrorMessage(error, 'Erreur lors de la suppression de la classe.'));
        }
      });
    }
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
            if (norm === 'nom' || norm === 'nom classe' || norm === 'classe') mapped.nom = String(row[key]);
            else if (norm === 'filiere' || norm === 'nom filiere' || norm === 'filiere associee') mapped.filiere = String(row[key]);
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
          if (!row.nom) clientErrors.push(`Ligne ${line} : Le nom de la classe est manquant.`);
          if (!row.filiere) clientErrors.push(`Ligne ${line} : La filière associée est manquante.`);
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

        this.api.importAdminClasses(payload).subscribe({
          next: (res) => {
            this.importErrors = [];
            this.importSuccessMessage = res.message || 'Importation réussie.';
            this.showImportResultModal = true;
            this.loadClasses();
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
