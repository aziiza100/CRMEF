import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-classes',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './classes.html',
  styleUrls: ['./classes.css']
})
export class AdminClassesComponent {
  
  searchTerm = '';
  selectedFilter = 'all';
  showModal = false;
  editingId: number | null = null;
  toastMessage = '';
  showToast = false;

  // Modèle de classe
  newClass = {
    nom: '',
    filiere: '',
    teachers: [] as string[]
  };

  // Liste globale des professeurs pour les cases à cocher
  availableTeachers = [
    'Pr. Benjelloun (Informatique)',
    'Pr. Idrissi (Sces de l\'Éducation)',
    'Pr. Alaoui (SVT)',
    'Pr. Cherkaoui (Mathématiques)'
  ];

  classes = [
    { id: 1, nom: 'SVT-4', filiere: 'SVT', studentsCount: 32, teachers: ['Pr. Alaoui', 'Pr. Idrissi'] },
    { id: 2, nom: 'Math-1', filiere: 'Mathématiques', studentsCount: 28, teachers: ['Pr. Cherkaoui', 'Pr. Benjelloun'] },
    { id: 3, nom: 'Info-2', filiere: 'Informatique', studentsCount: 25, teachers: ['Pr. Benjelloun'] }
  ];

  get filteredClasses() {
    return this.classes.filter(c => {
      const matchSearch = c.nom.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchFilter = this.selectedFilter === 'all' || c.filiere === this.selectedFilter;
      return matchSearch && matchFilter;
    });
  }

  openModal(cls?: any) {
    if (cls) {
      this.editingId = cls.id;
      this.newClass = { 
        nom: cls.nom, 
        filiere: cls.filiere, 
        teachers: [...cls.teachers]
      };
    } else {
      this.editingId = null;
      this.newClass = { nom: '', filiere: '', teachers: [] };
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  toggleTeacher(teacherName: string) {
    const idx = this.newClass.teachers.indexOf(teacherName);
    if (idx > -1) {
      this.newClass.teachers.splice(idx, 1);
    } else {
      this.newClass.teachers.push(teacherName);
    }
  }

  isTeacherSelected(teacherName: string) {
    return this.newClass.teachers.includes(teacherName);
  }

  saveClass() {
    if (this.editingId) {
      const idx = this.classes.findIndex(c => c.id === this.editingId);
      this.classes[idx] = { ...this.classes[idx], nom: this.newClass.nom, filiere: this.newClass.filiere, teachers: [...this.newClass.teachers] };
    } else {
      this.classes.unshift({
        id: Date.now(),
        nom: this.newClass.nom,
        filiere: this.newClass.filiere,
        studentsCount: 0, // Nouvelle classe = 0 étudiants
        teachers: [...this.newClass.teachers]
      });
    }
    
    this.closeModal();
    this.triggerToast(this.editingId ? 'Classe mise à jour.' : 'Nouvelle classe créée.');
  }

  deleteClass(id: number) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette classe ?")) {
      this.classes = this.classes.filter(c => c.id !== id);
      this.triggerToast('Classe supprimée.');
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
