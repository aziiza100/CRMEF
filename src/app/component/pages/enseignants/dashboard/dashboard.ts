import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-enseignant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class EnseignantDashboard implements OnInit {
  classesCount = 0;

  dashboardModules = [
    {
      id: 'messagerie',
      icon: 'bi-envelope-paper',
      colorClass: 'module-primary',
      badge: '3',
      route: '/espace-enseignant'
    },
    {
      id: 'telecharger-cours',
      icon: 'bi-cloud-arrow-down',
      colorClass: 'module-info',
      badge: null,
      route: '/espace-enseignant/telecharger-cours'
    },
    {
      id: 'deposer-cours',
      icon: 'bi-cloud-arrow-up',
      colorClass: 'module-success',
      badge: null,
      route: '/espace-enseignant/cours'
    },
    {
      id: 'gerer-notes',
      icon: 'bi-journal-check',
      colorClass: 'module-warning',
      badge: '!',
      route: '/espace-enseignant/notes'
    },
    {
      id: 'gerer-classes',
      icon: 'bi-people',
      colorClass: 'module-purple',
      badge: null,
      route: '/espace-enseignant/classes'
    },
    {
      id: 'profil',
      icon: 'bi-person-badge',
      colorClass: 'module-secondary',
      badge: null,
      route: '/espace-enseignant/profil'
    }
  ];

  recentActivities = [
    { text: 'Vous avez déposé le support "Didactique des SVT - Chap 3"', time: 'Il y a 2 heures', icon: 'bi-file-earmark-pdf', color: 'text-danger' },
    { text: 'Nouvelle note d\'information de la direction', time: 'Hier à 14h30', icon: 'bi-bell', color: 'text-warning' },
    { text: 'Saisie des notes finalisée pour le groupe SVT-2', time: 'Il y a 2 jours', icon: 'bi-check-circle', color: 'text-success' }
  ];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.api.getEnseignantProfile().subscribe({
      next: (profile) => {
        this.classesCount = profile.classes_count ?? 0;
      },
      error: () => {
        this.classesCount = 0;
      }
    });
  }
}
