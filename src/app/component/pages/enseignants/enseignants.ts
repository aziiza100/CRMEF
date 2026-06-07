import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-enseignants-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, TranslateModule],
  templateUrl: './enseignants.html',
  styleUrls: ['./enseignants.css']
})
export class Enseignants implements OnInit {
  enseignantName = 'Prof. Mohammed Alaoui';
  currentLang = 'fr';

  constructor(private translate: TranslateService, public router: Router, private api: ApiService) {
    const savedLang = localStorage.getItem('lang') || 'fr';
    this.currentLang = savedLang;
    this.translate.use(this.currentLang);
    document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
  }

  ngOnInit() {
    this.loadEnseignantProfile();
  }

  private loadEnseignantProfile() {
    this.api.getEnseignantProfile().subscribe({
      next: (profile) => {
        const name = profile.prenom && profile.nom ? `${profile.prenom} ${profile.nom}` : profile.nom ?? 'Enseignant';
        this.enseignantName = `Prof. ${name}`;
      },
      error: () => {
        // Keep placeholder name if profile cannot be loaded.
      }
    });
  }
  
  logout() {
    this.api.logout().subscribe({
      next: () => {
        localStorage.removeItem('crmef_admin_token');
        this.router.navigate(['/login']);
      },
      error: () => {
        localStorage.removeItem('crmef_admin_token');
        this.router.navigate(['/login']);
      }
    });
  }

  changeLang(lang: string) {
    this.translate.use(lang);
    this.currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  dashboardModules = [
    {
      id: 'messagerie',
      icon: 'bi-envelope-paper',
      route: null
    },
    {
      id: 'telecharger-cours',
      icon: 'bi-download',
      route: '/espace-enseignant/telecharger-cours'
    },
    {
      id: 'deposer-cours',
      icon: 'bi-cloud-arrow-up',
      route: '/espace-enseignant/cours'
    },
    {
      id: 'gerer-notes',
      icon: 'bi-journal-check',
      route: '/espace-enseignant/notes'
    },
    {
      id: 'gerer-classes',
      icon: 'bi-people',
      route: '/espace-enseignant/classes'
    },
    {
      id: 'profil',
      icon: 'bi-person-badge',
      route: '/espace-enseignant/profil'
    }
  ];
}