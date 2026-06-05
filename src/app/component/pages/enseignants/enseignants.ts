import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-enseignants-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, TranslateModule],
  templateUrl: './enseignants.html',
  styleUrls: ['./enseignants.css']
})
export class Enseignants {
  enseignantName = 'Prof. Mohammed Alaoui';
  currentLang = 'fr';

  constructor(private translate: TranslateService, public router: Router) {
    const savedLang = localStorage.getItem('lang') || 'fr';
    this.currentLang = savedLang;
    this.translate.use(this.currentLang);
    document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
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