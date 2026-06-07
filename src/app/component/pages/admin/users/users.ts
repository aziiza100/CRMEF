import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../../../core/services/api.service';

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
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class AdminUsersComponent implements OnInit {
  constructor(private api: ApiService) {}

  activeTab: 'etudiants' | 'profs' = 'etudiants';
  showModal = false;
  editingId: number | null = null;

  searchTerm = '';
  selectedFilter = 'all';
  
  toastMessage = '';
  showToast = false;

  @ViewChild('imageInput') imageInput?: ElementRef<HTMLInputElement>;
  imagePreview: string | null = null;
  selectedImageFile: File | null = null;

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

  switchTab(tab: 'etudiants' | 'profs') {
    this.activeTab = tab;
    this.searchTerm = '';
    this.selectedFilter = 'all';
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
      };
      this.imagePreview = user.image_base64 || user.avatar || null;
      this.selectedImageFile = null;
      if (this.imageInput?.nativeElement) {
        this.imageInput.nativeElement.value = '';
      }
    } else {
      this.editingId = null;
      this.newUser = { role: this.activeTab === 'etudiants' ? 'student' : 'teacher', nom: '', prenom: '', email: '', cne: '', cin: '', classe: '', specialite: '', grade: '', tele: '', classes: [] };
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
            this.loadEtudiants();
            this.triggerToast(`Étudiant ajouté. Mot de passe généré : ${response.password}`);
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
            this.loadEnseignants();
            this.triggerToast(`Enseignant ajouté. Mot de passe généré : ${response.password}`);
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

}
