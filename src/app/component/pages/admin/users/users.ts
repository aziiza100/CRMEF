import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../../../core/services/api.service';
import { SearchService } from '../../../../core/services/search.service';
import { PaginationComponent } from '../../../shared/pagination/pagination';

declare var XLSX: any;

type AdminUserForm = {
  role: 'student' | 'teacher';
  nom: string;
  prenom: string;
  email: string;
  cne: string;
  cin: string;
  classe: string;
  specialite: string;
  grade: string;
  tele: string;
  classes: string[];
  password?: string;
};

type EtudiantItem = {
  id: number;
  nom: string;
  email: string;
  cne: string;
  cin?: string;
  tele?: string;
  classe: string;
  avatar: string;
};

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PaginationComponent],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class AdminUsersComponent implements OnInit {
  constructor(private api: ApiService, private searchService: SearchService) {}

  activeTab: 'etudiants' | 'profs' = 'etudiants';
  showModal = false;
  editingId: number | null = null;

  searchTerm = '';
  selectedFilter = 'all';
  
  toastMessage = '';
  showToast = false;

  currentPage = 1;
  pageSize = 10;

  @ViewChild('imageInput') imageInput?: ElementRef<HTMLInputElement>;
  @ViewChild('excelInput') excelInput?: ElementRef<HTMLInputElement>;
  
  imagePreview: string | null = null;
  selectedImageFile: File | null = null;

  // Excel bulk import properties
  showImportResultModal = false;
  importErrors: string[] = [];
  importSuccessMessage = '';
  importedUsers: any[] = [];

  // Formulaire d'ajout / modif
  newUser: AdminUserForm = {
    role: 'student',
    nom: '',
    prenom: '',
    email: '',
    cne: '',
    cin: '',
    classe: '',
    specialite: '',
    grade: '',
    tele: '',
    classes: [],
  };

  // Liste des classes pour le sélecteur multiple
  availableClasses: any[] = [];
  specialityFilters: string[] = [];

  etudiants: EtudiantItem[] = [];

  profs: Array<any> = [];

  get filteredEtudiants() {
    return this.etudiants.filter(e => {
      const matchSearch = e.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                          e.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchFilter = this.selectedFilter === 'all' || e.classe === this.selectedFilter;
      return matchSearch && matchFilter;
    });
  }

  get filteredProfs() {
    return this.profs.filter(p => {
      const matchSearch = p.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                          p.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchFilter = this.selectedFilter === 'all' || p.specialite === this.selectedFilter;
      return matchSearch && matchFilter;
    });
  }

  get paginatedEtudiants() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredEtudiants.slice(startIndex, startIndex + this.pageSize);
  }

  get paginatedProfs() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredProfs.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  switchTab(tab: 'etudiants' | 'profs') {
    this.activeTab = tab;
    this.searchTerm = '';
    this.selectedFilter = 'all';
    this.currentPage = 1;
  }

  private splitName(fullName: string) {
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length <= 1) {
      return { prenom: '', nom: parts[0] || '' };
    }
    const nom = parts.pop() || '';
    const prenom = parts.join(' ');
    return { prenom, nom };
  }

  openModal(user?: any) {
    if (user) {
      this.editingId = user.id;
      const { prenom, nom } = this.splitName(user.nom || '');
      this.newUser = { 
        role: this.activeTab === 'etudiants' ? 'student' : 'teacher',
        nom,
        prenom,
        email: user.email, 
        cne: user.cne || '', 
        cin: user.cin || '',
        classe: user.classe || '', 
        specialite: user.specialite || user.matiere || '',
        grade: user.grade || '',
        tele: user.tele || '',
        classes: user.classes ? [...user.classes] : [],
        password: '',
      };
      this.imagePreview = user.image_base64 || user.avatar || null;
      this.selectedImageFile = null;
      if (this.imageInput?.nativeElement) {
        this.imageInput.nativeElement.value = '';
      }
    } else {
      this.editingId = null;
      this.newUser = { role: this.activeTab === 'etudiants' ? 'student' : 'teacher', nom: '', prenom: '', email: '', cne: '', cin: '', classe: '', specialite: '', grade: '', tele: '', classes: [], password: '' };
      if (this.newUser.role === 'student' && this.availableClasses.length > 0) {
        this.newUser.classe = this.availableClasses[0].nom;
      }
      this.imagePreview = null;
      this.selectedImageFile = null;
      if (this.imageInput?.nativeElement) {
        this.imageInput.nativeElement.value = '';
      }
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }



  triggerImageUpload() {
    if (this.imageInput?.nativeElement) {
      this.imageInput.nativeElement.value = '';
      this.imageInput.nativeElement.click();
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files?.[0] as File | undefined;
    if (!file) {
      return;
    }

    this.selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  getTeacherPayload() {
    const payload: any = {
      email: this.newUser.email,
      nom: this.newUser.nom,
      prenom: this.newUser.prenom,
      cin: this.newUser.cin || null,
      tele: this.newUser.tele || null,
      specialite: this.newUser.specialite,
      grade: this.newUser.grade || 'Enseignant',
    };

    if (this.newUser.password) {
      payload.password = this.newUser.password;
    }

  
    if (this.selectedImageFile) {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value as string);
        }
      });
      formData.append('image', this.selectedImageFile);
      return formData;
    }

    return payload;
  }

  ngOnInit() {
    this.searchService.currentSearch$.subscribe((term: string) => {
      this.searchTerm = term;
      this.currentPage = 1;
    });
    this.loadClasses();
    this.loadEtudiants();
    this.loadEnseignants();
  }

  loadClasses() {
    this.api.getAdminClasses().subscribe({
      next: (classes) => {
        this.availableClasses = classes;
        if (!this.editingId && this.newUser.role === 'student' && this.availableClasses.length > 0) {
          this.newUser.classe = this.availableClasses[0].nom;
        }
      },
      error: () => {}
    });
  }

  loadEtudiants() {
    this.api.getAdminStudents().subscribe({
      next: (users) => {
        this.etudiants = users.map((user: any) => {
          return {
            id: user.id,
            nom: user.prenom && user.nom ? `${user.prenom} ${user.nom}` : user.nom || '',
            email: user.email,
            cne: user.etudiant?.cne || '',
            cin: user.cin || '',
            tele: user.tele || '',
            classe: user.etudiant?.classe?.nom || '',
            avatar: user.image_base64 || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.prenom || '')}+${encodeURIComponent(user.nom || '')}&background=0f172a&color=fff`
          };
        });
      },
      error: () => {}
    });
  }

  loadEnseignants() {
    this.api.getAdminEnseignants().subscribe({
      next: (users) => {
        const uniqueSpecialities = new Set<string>();
      this.profs = users.map((user: any) => {
        const specialite = user.enseignant?.specialite || '';
        if (specialite) {
          uniqueSpecialities.add(specialite);
        }
        return {
          id: user.id,
          nom: user.prenom && user.nom ? `${user.prenom} ${user.nom}` : user.nom || '',
          email: user.email,
          cin: user.cin || '',
          tele: user.tele || '',
          specialite,
          grade: user.enseignant?.grade || '',
          classes: user.enseignant?.classes ? Array.from(new Set(user.enseignant.classes.map((c: any) => c.nom))) : [],
          avatar: user.image_base64 || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.prenom || '')}+${encodeURIComponent(user.nom || '')}&background=0f172a&color=fff`
        };
      });
      this.specialityFilters = Array.from(uniqueSpecialities).sort();
      },
      error: () => {
        // Keep the page working with static demo data if the API is unavailable.
      }
    });
  }

  getStudentPayload() {
    const matchedClass = this.availableClasses.find(c => c.nom === this.newUser.classe);
    const classeId = matchedClass ? matchedClass.id : null;

    const payload: any = {
      email: this.newUser.email,
      nom: this.newUser.nom,
      prenom: this.newUser.prenom,
      cne: this.newUser.cne,
      cin: this.newUser.cin || null,
      tele: this.newUser.tele || null,
      classe_id: classeId,
    };

    if (this.newUser.password) {
      payload.password = this.newUser.password;
    }

    if (this.selectedImageFile) {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value as string);
        }
      });
      formData.append('image', this.selectedImageFile);
      return formData;
    }

    return payload;
  }

  saveUser() {
    if (this.newUser.role === 'student') {
      const payload = this.getStudentPayload();

      if (this.editingId) {
        this.api.updateAdminStudent(this.editingId, payload).subscribe({
          next: () => {
            this.loadEtudiants();
            this.triggerToast('Étudiant mis à jour avec succès.');
            this.closeModal();
          },
          error: (err) => {
            this.triggerToast(err.message || 'Erreur lors de la mise à jour de l’étudiant.');
          }
        });
      } else {
        this.api.createAdminStudent(payload).subscribe({
          next: (response) => {
            if (response.password) {
              alert(`Étudiant créé avec succès !\nLe mot de passe généré est : ${response.password}\nVeuillez le noter.`);
            }
            this.loadEtudiants();
            this.closeModal();
          },
          error: (err) => {
            this.triggerToast(err.message || 'Erreur lors de l’ajout de l’étudiant.');
          }
        });
      }
    } else {
      const payload = this.getTeacherPayload();

      if (this.editingId) {
        this.api.updateAdminEnseignant(this.editingId, payload).subscribe({
          next: () => {
            this.loadEnseignants();
            this.triggerToast('Enseignant mis à jour avec succès.');
            this.closeModal();
          },
          error: () => {
            this.triggerToast('Erreur lors de la mise à jour de l’enseignant.');
          }
        });
      } else {
        this.api.createAdminEnseignant(payload).subscribe({
          next: (response) => {
            if (response.password) {
              alert(`Enseignant ajouté avec succès !\nMot de passe généré : ${response.password}\nVeuillez le noter.`);
            }
            this.loadEnseignants();
            this.closeModal();
          },
          error: () => {
            this.triggerToast('Erreur lors de l’ajout de l’enseignant.');
          }
        });
      }
    }
  }

  deleteUser(id: number) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return;
    }

    if (this.activeTab === 'etudiants') {
      this.api.deleteAdminStudent(id).subscribe({
        next: () => {
          this.loadEtudiants();
          this.triggerToast('Étudiant supprimé avec succès.');
        },
        error: () => {
          this.triggerToast('Erreur lors de la suppression de l’étudiant.');
        }
      });
    } else {
      this.api.deleteAdminEnseignant(id).subscribe({
        next: () => {
          this.loadEnseignants();
          this.triggerToast('Enseignant supprimé avec succès.');
        },
        error: () => {
          this.triggerToast('Erreur lors de la suppression de l’enseignant.');
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

        const mapExcelRow = (row: any, role: 'student' | 'teacher') => {
          const mapped: any = {};
          for (const key of Object.keys(row)) {
            const norm = normalizeKey(key);
            if (norm === 'prenom') mapped.prenom = String(row[key]);
            else if (norm === 'nom') mapped.nom = String(row[key]);
            else if (norm === 'email' || norm === 'adresse email') mapped.email = String(row[key]);
            else if (norm === 'mot de passe' || norm === 'password' || norm === 'motdepasse') mapped.password = String(row[key]);
            else if (norm === 'cin') mapped.cin = String(row[key]);
            else if (norm === 'telephone' || norm === 'tele') mapped.tele = String(row[key]);
            else if (role === 'student') {
              if (norm === 'cne' || norm === 'cne / code massar' || norm === 'codemassar') mapped.cne = String(row[key]);
              else if (norm === 'classe' || norm === 'affectation (classe)' || norm === 'affectation') mapped.classe = String(row[key]);
            } else if (role === 'teacher') {
              if (norm === 'matiere' || norm === 'specialite' || norm === 'matiere (specialite principale)' || norm === 'specialite principale') mapped.specialite = String(row[key]);
              else if (norm === 'grade') mapped.grade = String(row[key]);
            }
          }
          return mapped;
        };

        const mappedRows = rawRows.map((row, idx) => {
          const mapped = mapExcelRow(row, this.activeTab === 'etudiants' ? 'student' : 'teacher');
          mapped._rowIndex = idx + 2;
          return mapped;
        });

        // Client side validation
        const clientErrors: string[] = [];
        for (const row of mappedRows) {
          const line = row._rowIndex;
          if (!row.prenom) clientErrors.push(`Ligne ${line} : Le prénom est manquant.`);
          if (!row.nom) clientErrors.push(`Ligne ${line} : Le nom est manquant.`);
          if (!row.email) clientErrors.push(`Ligne ${line} : L'adresse email est manquante.`);
          
          if (this.activeTab === 'etudiants') {
            if (!row.cin) clientErrors.push(`Ligne ${line} : Le CIN est manquant.`);
            if (!row.cne) clientErrors.push(`Ligne ${line} : Le CNE est manquant.`);
            if (!row.classe) clientErrors.push(`Ligne ${line} : La classe est manquante.`);
          } else {
            if (!row.specialite) clientErrors.push(`Ligne ${line} : La spécialité/matière est manquante.`);
            if (!row.grade) clientErrors.push(`Ligne ${line} : Le grade est manquant.`);
          }
        }

        if (clientErrors.length > 0) {
          this.importErrors = clientErrors;
          this.importSuccessMessage = '';
          this.importedUsers = [];
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

        if (this.activeTab === 'etudiants') {
          this.api.importAdminStudents(payload).subscribe({
            next: (res) => {
              this.importErrors = [];
              this.importSuccessMessage = res.message || 'Importation réussie.';
              this.importedUsers = res.imported || [];
              this.showImportResultModal = true;
              this.loadEtudiants();
              if (this.excelInput?.nativeElement) this.excelInput.nativeElement.value = '';
            },
            error: (err) => {
              this.importErrors = err.error?.errors || [err.message || 'Erreur lors de l\'importation.'];
              this.importSuccessMessage = '';
              this.importedUsers = [];
              this.showImportResultModal = true;
              if (this.excelInput?.nativeElement) this.excelInput.nativeElement.value = '';
            }
          });
        } else {
          this.api.importAdminEnseignants(payload).subscribe({
            next: (res) => {
              this.importErrors = [];
              this.importSuccessMessage = res.message || 'Importation réussie.';
              this.importedUsers = res.imported || [];
              this.showImportResultModal = true;
              this.loadEnseignants();
              if (this.excelInput?.nativeElement) this.excelInput.nativeElement.value = '';
            },
            error: (err) => {
              this.importErrors = err.error?.errors || [err.message || 'Erreur lors de l\'importation.'];
              this.importSuccessMessage = '';
              this.importedUsers = [];
              this.showImportResultModal = true;
              if (this.excelInput?.nativeElement) this.excelInput.nativeElement.value = '';
            }
          });
        }
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
    this.importedUsers = [];
  }

  downloadCredentialsCSV() {
    if (this.importedUsers.length === 0) return;

    const headers = ['Email', 'Nom', 'Prenom', 'Mot de passe'];
    const rows = this.importedUsers.map(u => [u.email, u.nom, u.prenom, u.password || '']);

    const BOM = '\uFEFF';
    const csvContent = BOM + [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `identifiants_import_${this.activeTab}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

}
