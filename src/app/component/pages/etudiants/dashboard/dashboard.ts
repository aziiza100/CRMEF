import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-etudiant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class EtudiantDashboardComponent implements OnInit {
  
  prochainCours = {
    matiere: 'Chargement...',
    salle: '',
    heure: ''
  };

  derniereNote: any = {
    matiere: '',
    note: '',
    date: ''
  };

  nouveauxSupports = 0;

  coursDuJour: Array<{ heure: string; matiere: string; salle: string; type: string }> = [];

  derniersCoursElearning: Array<{ id: number; moduleId: number; titre: string; nom_fichier: string; format: string; professeur: string; date: string }> = [];

  messages: Array<{ titre: string; date: string; urgent: boolean }> = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.apiService.getStudentDashboard().subscribe({
      next: (response: any) => {
        if (response) {
          this.prochainCours = response.prochainCours || { matiere: 'Aucun cours prévu', salle: '', heure: '' };
          this.derniereNote = response.derniereNote || { matiere: 'Aucune note publiée', note: 'Aucune', date: '' };
          this.nouveauxSupports = response.nouveauxSupports ?? 0;
          this.coursDuJour = response.coursDuJour || [];
          this.derniersCoursElearning = response.derniersCoursElearning || [];
          this.messages = response.messages || [];
        }
      },
      error: (error: any) => {
        console.error('Erreur chargement tableau de bord étudiant', error);
      }
    });
  }

  downloadSupport(doc: any): void {
    if (!doc.moduleId || !doc.id) return;
    this.apiService.downloadSupportFile(doc.moduleId, doc.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.nom_fichier || 'support';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => console.error('Erreur téléchargement support', error)
    });
  }
}
