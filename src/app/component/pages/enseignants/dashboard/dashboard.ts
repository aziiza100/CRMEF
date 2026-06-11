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
  // Stats dynamiques
  classesCount = 0;
  coursesCount = 0;   
  totalHours = 0;     

  // Prochain cours dynamique
  nextClass: any = null;

  dashboardModules = [ 
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
      badge: null, 
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

  // Activities dynamiques
  recentActivities: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.api.getEnseignantDashbord().subscribe({
      next: (response: any) => {
        const profile = response.enseignant || response;
        
        // 1. Stats Calculation
        if (profile.classes) {
          this.classesCount = profile.classes.length;
        } else {
          this.classesCount = response.classes_count ?? 0;
        }

        const modules = profile.modules || [];
        this.coursesCount = modules.length || response.modules_count || 0;

        let hoursSum = 0;
        modules.forEach((mod: any) => {
          hoursSum += Number(mod.masse_horraire || mod.masse_horaire || 0);
        });
        this.totalHours = hoursSum > 0 ? hoursSum : (response.heures_count ?? 18);

        // 2. Activités Récentes Dynamiques (Mapping)
        if (response.activities && response.activities.length > 0) {
          this.recentActivities = response.activities.map((act: any) => ({
            text: act.description || act.text || 'Activité enregistrée',
            time: act.time || act.created_at_formatted || 'Récemment',
            icon: act.icon || 'bi-file-earmark-text',
            color: act.color || 'text-primary'
          }));
        } else {
          // Fallback au cas ou l'historique est vide
          this.recentActivities = [
            { text: `Vous êtes affecté à ${this.coursesCount} modules de formation.`, time: 'Actualisé à l\'instant', icon: 'bi-info-circle', color: 'text-info' },
            { text: 'Saisie des notes disponible pour vos classes.', time: 'Actif', icon: 'bi-check-circle', color: 'text-success' }
          ];
        }

        // 3. Prochain Cours Dynamique
        if (response.next_class || response.prochain_cours) {
          const nc = response.next_class || response.prochain_cours;
          this.nextClass = {
            time: `${nc.heure_debut || nc.time_start || '14:30'} - ${nc.heure_fin || nc.time_end || '16:30'}`,
            subject: nc.module_nom || nc.module || 'Cours non spécifié',
            location: nc.salle || nc.room || 'Salle non définie',
            classe: nc.classe_nom || nc.classe || ''
          };
        } else {
          this.nextClass = null; // Ghadi i-biyyen design compact f l-html ila makaynch cours jay
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement du dashboard enseignant:', err);
        this.classesCount = 0;
        this.coursesCount = 0;
        this.totalHours = 0;
        this.nextClass = null;
      }
    });
  }
}