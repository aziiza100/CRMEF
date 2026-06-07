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
  statut: string;
};

type EtudiantItem = {
  id: number;
  nom: string;
  email: string;
  cne: string;
  cin?: string;
  tele?: string;
  classe: string;
  statut: string;
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
    statut: 'actif'
  };

  // Liste des classes pour le sélecteur multiple
  availableClasses = ['SVT-4', 'Math-1', 'Info-2'];
  specialityFilters: string[] = [];

  etudiants: EtudiantItem[] = [
    { id: 1, nom: 'Ahmed Yassine', email: 'ahmed.yassine@gmail.com', cne: 'G123456789', classe: 'SVT-4', statut: 'actif', avatar: 'https://ui-avatars.com/api/?name=Ahmed+Yassine&background=random' },
    { id: 2, nom: 'Fatima Zahra', email: 'fatima@gmail.com', cne: 'M987654321', classe: 'Math-1', statut: 'actif', avatar: 'https://ui-avatars.com/api/?name=Fatima+Zahra&background=random' },
    { id: 3, nom: 'Karim Alaoui', email: 'karim@gmail.com', cne: 'K456123789', classe: 'SVT-4', statut: 'bloque', avatar: 'https://ui-avatars.com/api/?name=Karim+Alaoui&background=random' }
  ];

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
        statut: user.actif || 'actif'
      };
      this.imagePreview = user.image_base64 || user.avatar || null;
      this.selectedImageFile = null;
      if (this.imageInput?.nativeElement) {
        this.imageInput.nativeElement.value = '';
      }
    } else {
      this.editingId = null;
      this.newUser = { role: this.activeTab === 'etudiants' ? 'student' : 'teacher', nom: '', prenom: '', email: '', cne: '', cin: '', classe: '', specialite: '', grade: '', tele: '', classes: [], statut: 'actif' };
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

  toggleProfClass(cls: string) {
    const idx = this.newUser.classes.indexOf(cls);
    if (idx > -1) {
      this.newUser.classes.splice(idx, 1);
    } else {
      this.newUser.classes.push(cls);
    }
  }

  isProfClassSelected(cls: string) {
    return this.newUser.classes.includes(cls);
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

    if (this.editingId) {
      payload.actif = this.newUser.statut;
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
    this.loadEnseignants();
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
          classes: [],
          statut: user.actif || 'actif',
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

  saveUser() {
    const fullName = `${this.newUser.prenom} ${this.newUser.nom}`.trim();

    if (this.newUser.role === 'student') {
      if (this.editingId) {
        const idx = this.etudiants.findIndex(e => e.id === this.editingId);
        this.etudiants[idx] = { ...this.etudiants[idx], nom: fullName || this.newUser.nom, email: this.newUser.email, cin: this.newUser.cin, tele: this.newUser.tele, cne: this.newUser.cne, classe: this.newUser.classe, statut: this.newUser.statut };
        this.triggerToast('Étudiant mis à jour avec succès.');
      } else {
        this.etudiants.unshift({
          id: Date.now(),
          nom: fullName || this.newUser.nom,
          email: this.newUser.email,
          cin: this.newUser.cin,
          tele: this.newUser.tele,
          cne: this.newUser.cne,
          classe: this.newUser.classe,
          statut: this.newUser.statut,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || this.newUser.nom)}&background=random`
        });
        this.triggerToast('Nouvel étudiant ajouté.');
      }
      this.closeModal();
    } else {
      const payload = this.getTeacherPayload();

      if (this.editingId) {
        this.api.updateAdminEnseignant(this.editingId, payload).subscribe({
          next: (response) => {
            const updated = response.user || response;
            const idx = this.profs.findIndex(p => p.id === this.editingId);
            const updatedName = `${updated.prenom || this.newUser.prenom} ${updated.nom || this.newUser.nom}`.trim();
            this.profs[idx] = {
              ...this.profs[idx],
              nom: updatedName,
              email: updated.email,
              cin: updated.cin || this.newUser.cin,
              tele: updated.tele || this.newUser.tele,
              specialite: updated.enseignant?.specialite || this.newUser.specialite,
              grade: updated.enseignant?.grade || this.newUser.grade,
              classes: [...this.newUser.classes],
              statut: this.newUser.statut,
            };
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
            const user = response.user;
            const enseignant = response.user?.enseignant || response.enseignant || {};
            const newProf = {
              id: user.id,
              nom: `${user.prenom || this.newUser.prenom} ${user.nom || this.newUser.nom}`.trim(),
              email: user.email,
              specialite: enseignant.specialite || this.newUser.specialite,
              grade: enseignant.grade || this.newUser.grade,
              tele: user.tele || this.newUser.tele,
              classes: [...this.newUser.classes],
              statut: user.actif || this.newUser.statut || 'bloque',
              avatar: user.image_base64 || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.prenom || this.newUser.prenom)}+${encodeURIComponent(user.nom || this.newUser.nom)}&background=0f172a&color=fff`
            };
            this.profs.unshift(newProf);
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
          this.etudiants = this.etudiants.filter(e => e.id !== id);
          this.triggerToast('Étudiant supprimé avec succès.');
        },
        error: () => {
          this.triggerToast('Erreur lors de la suppression de l’étudiant.');
        }
      });
    } else {
      this.api.deleteAdminEnseignant(id).subscribe({
        next: () => {
          this.profs = this.profs.filter(p => p.id !== id);
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
