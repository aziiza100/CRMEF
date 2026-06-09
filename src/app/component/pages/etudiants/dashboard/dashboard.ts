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

  derniereNote = {
    matiere: 'TICE',
    note: 17.5,
    date: 'Aujourd\'hui'
  };

  nouveauxSupports = 3;

  coursDuJour: Array<{ heure: string; matiere: string; salle: string; type: string }> = [];

  derniersCoursElearning = [
    { titre: 'Introduction au TICE', format: 'pdf', professeur: 'Pr. Benjelloun', date: 'Il y a 2h' },
    { titre: 'Chapitre 2 : La Cellule', format: 'doc', professeur: 'Pr. Alaoui', date: 'Hier' }
  ];

  messages = [
    { titre: 'Rappel : Dépôt du rapport de stage', date: '12 Nov 2023', urgent: true },
    { titre: 'Changement de salle pour le cours de demain', date: '11 Nov 2023', urgent: false }
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadTodaySchedule();
  }

  private loadTodaySchedule(): void {
    this.apiService.getStudentEmploi().subscribe({
      next: (response: any) => {
        const allSeances = Array.isArray(response?.seances)
          ? response.seances
          : Array.isArray(response)
          ? response
          : [];

        const today = this.getDayId(new Date());
        const seances = allSeances.filter((item: any) => this.normalizeDay(item.jour) === today);
        this.coursDuJour = seances.map((item: any) => ({
          heure: `${this.formatTime(item.heureDebut)} - ${this.formatTime(item.heureFin)}`,
          matiere: item.matiere,
          salle: item.salle,
          type: item.type || 'cours'
        }));

        if (this.coursDuJour.length > 0) {
          const next = this.coursDuJour[0];
          this.prochainCours = {
            matiere: next.matiere,
            salle: next.salle,
            heure: next.heure
          };
        } else {
          this.prochainCours = {
            matiere: 'Aucun cours aujourd\'hui',
            salle: '',
            heure: ''
          };
        }
      },
      error: (error: any) => {
        console.error('Erreur chargement emploi du temps étudiant', error);
        this.coursDuJour = [];
      }
    });
  }

  private normalizeDay(jour: unknown): string {
    const raw = String(jour || '').toLowerCase().trim();
    const mapping: Record<string, string> = {
      'lundi': 'lundi',
      'mardi': 'mardi',
      'mercredi': 'mercredi',
      'jeudi': 'jeudi',
      'vendredi': 'vendredi',
      'samedi': 'samedi',
      'dimanche': 'dimanche',
      'monday': 'lundi',
      'tuesday': 'mardi',
      'wednesday': 'mercredi',
      'thursday': 'jeudi',
      'friday': 'vendredi',
      'saturday': 'samedi',
      'sunday': 'dimanche'
    };
    return mapping[raw] ?? raw;
  }

  private formatTime(value: unknown): string {
    const time = String(value || '').trim();
    const match = time.match(/^(\d{1,2}:\d{2})/);
    return match ? match[1] : time;
  }

  private getDayId(date: Date): string {
    const mapping: Record<number, string> = {
      0: 'dimanche',
      1: 'lundi',
      2: 'mardi',
      3: 'mercredi',
      4: 'jeudi',
      5: 'vendredi',
      6: 'samedi'
    };
    return mapping[date.getDay()] || 'lundi';
  }
}
