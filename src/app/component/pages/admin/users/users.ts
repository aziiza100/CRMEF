import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class AdminUsersComponent {
  
  activeTab: 'etudiants' | 'profs' = 'etudiants';
  showModal = false;
  editingId: number | null = null;

  searchTerm = '';
  selectedFilter = 'all';
  
  toastMessage = '';
  showToast = false;

  // Formulaire d'ajout / modif
  newUser = {
    role: 'student',
    nom: '',
    email: '',
    cne: '',
    classe: '',
    matiere: '',
    classes: [] as string[],
    statut: 'actif'
  };

  // Liste des classes pour le sélecteur multiple
  availableClasses = ['SVT-4', 'Math-1', 'Info-2'];

  etudiants = [
    { id: 1, nom: 'Ahmed Yassine', email: 'ahmed.yassine@gmail.com', cne: 'G123456789', classe: 'SVT-4', statut: 'actif', avatar: 'https://ui-avatars.com/api/?name=Ahmed+Yassine&background=random' },
    { id: 2, nom: 'Fatima Zahra', email: 'fatima@gmail.com', cne: 'M987654321', classe: 'Math-1', statut: 'actif', avatar: 'https://ui-avatars.com/api/?name=Fatima+Zahra&background=random' },
    { id: 3, nom: 'Karim Alaoui', email: 'karim@gmail.com', cne: 'K456123789', classe: 'SVT-4', statut: 'bloque', avatar: 'https://ui-avatars.com/api/?name=Karim+Alaoui&background=random' }
  ];

  profs = [
    { id: 1, nom: 'Pr. Benjelloun', email: 'benjelloun@crmef.ma', matiere: 'Informatique', classes: ['Info-2', 'Math-1'], statut: 'actif', avatar: 'https://ui-avatars.com/api/?name=Pr+Benjelloun&background=0f172a&color=fff' },
    { id: 2, nom: 'Pr. Idrissi', email: 'idrissi@crmef.ma', matiere: 'Sciences de l\'Éducation', classes: ['SVT-4'], statut: 'actif', avatar: 'https://ui-avatars.com/api/?name=Pr+Idrissi&background=0f172a&color=fff' }
  ];

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
      const matchFilter = this.selectedFilter === 'all' || p.matiere === this.selectedFilter;
      return matchSearch && matchFilter;
    });
  }

  switchTab(tab: 'etudiants' | 'profs') {
    this.activeTab = tab;
    this.searchTerm = '';
    this.selectedFilter = 'all';
  }

  openModal(user?: any) {
    if (user) {
      this.editingId = user.id;
      this.newUser = { 
        role: this.activeTab === 'etudiants' ? 'student' : 'teacher',
        nom: user.nom, 
        email: user.email, 
        cne: user.cne || '', 
        classe: user.classe || '', 
        matiere: user.matiere || '',
        classes: user.classes ? [...user.classes] : [],
        statut: user.statut
      };
    } else {
      this.editingId = null;
      this.newUser = { role: this.activeTab === 'etudiants' ? 'student' : 'teacher', nom: '', email: '', cne: '', classe: '', matiere: '', classes: [], statut: 'actif' };
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

  saveUser() {
    if (this.newUser.role === 'student') {
      if (this.editingId) {
        const idx = this.etudiants.findIndex(e => e.id === this.editingId);
        this.etudiants[idx] = { ...this.etudiants[idx], nom: this.newUser.nom, email: this.newUser.email, cne: this.newUser.cne, classe: this.newUser.classe, statut: this.newUser.statut };
      } else {
        this.etudiants.unshift({
          id: Date.now(), nom: this.newUser.nom, email: this.newUser.email, cne: this.newUser.cne, classe: this.newUser.classe, statut: this.newUser.statut, avatar: `https://ui-avatars.com/api/?name=${this.newUser.nom.replace(' ', '+')}&background=random`
        });
      }
    } else {
      if (this.editingId) {
        const idx = this.profs.findIndex(p => p.id === this.editingId);
        this.profs[idx] = { ...this.profs[idx], nom: this.newUser.nom, email: this.newUser.email, matiere: this.newUser.matiere, classes: [...this.newUser.classes], statut: this.newUser.statut };
      } else {
        this.profs.unshift({
          id: Date.now(), nom: this.newUser.nom, email: this.newUser.email, matiere: this.newUser.matiere, classes: [...this.newUser.classes], statut: this.newUser.statut, avatar: `https://ui-avatars.com/api/?name=${this.newUser.nom.replace(' ', '+')}&background=0f172a&color=fff`
        });
      }
    }
    
    this.closeModal();
    this.triggerToast(this.editingId ? 'Utilisateur mis à jour avec succès.' : 'Nouvel utilisateur ajouté.');
  }

  deleteUser(id: number) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      if (this.activeTab === 'etudiants') {
        this.etudiants = this.etudiants.filter(e => e.id !== id);
      } else {
        this.profs = this.profs.filter(p => p.id !== id);
      }
      this.triggerToast('Utilisateur supprimé avec succès.');
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
