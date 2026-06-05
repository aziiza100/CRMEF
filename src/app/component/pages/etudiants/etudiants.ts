import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-etudiants-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './etudiants.html',
  styleUrls: ['./etudiants.css']
})
export class EtudiantsComponent implements OnInit, OnDestroy {
  currentLang: string = 'fr';
  
  menuItems = [
    {
      id: 'dashboard',
      icon: 'bi-grid-1x2',
      route: '/espace-etudiant' // on root it should redirect to dashboard
    },
    {
      id: 'elearning',
      icon: 'bi-laptop',
      route: '/espace-etudiant/elearning'
    },
    {
      id: 'resultats',
      icon: 'bi-bar-chart-line',
      route: '/espace-etudiant/resultats'
    },
    {
      id: 'emploi',
      icon: 'bi-calendar3',
      route: '/espace-etudiant/emploi'
    },
    {
      id: 'messagerie',
      icon: 'bi-chat-dots',
      route: null
    },
    {
      id: 'profil',
      icon: 'bi-person',
      route: '/espace-etudiant/profil'
    }
  ];

  constructor(public router: Router, private translate: TranslateService) {
    const savedLang = localStorage.getItem('lang') || 'fr';
    this.currentLang = savedLang;
    this.translate.use(this.currentLang);
    this.updateDirection();
  }

  ngOnInit() {
    this.updateDirection();
  }

  ngOnDestroy() {
    // Reset direction if we leave the module
    document.documentElement.dir = 'ltr';
  }

  changeLang() {
    this.currentLang = this.currentLang === 'fr' ? 'ar' : 'fr';
    this.translate.use(this.currentLang);
    localStorage.setItem('lang', this.currentLang);
    this.updateDirection();
  }

  private updateDirection() {
    if (this.currentLang === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }

  logout() {
    this.router.navigate(['/']);
  }
}