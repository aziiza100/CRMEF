import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent {
  
  isSidebarCollapsed = false;
  currentLang = 'fr';
  adminName = 'Admin Principal';

  menuItems = [
    {
      id: 'dashboard',
      icon: 'bi-grid-1x2-fill',
      route: '/espace-admin/dashboard'
    },
    {
      id: 'users',
      icon: 'bi-people-fill',
      route: '/espace-admin/users'
    },
    {
      id: 'classes',
      icon: 'bi-diagram-3-fill',
      route: '/espace-admin/classes'
    },
    {
      id: 'content',
      icon: 'bi-newspaper',
      route: '/espace-admin/content'
    },
    {
      id: 'emploi',
      icon: 'bi-calendar3',
      route: '/espace-admin/emploi'
    },
    {
      id: 'messages',
      icon: 'bi-envelope',
      route: '/espace-admin/messages'
    },
    {
      id: 'settings',
      icon: 'bi-gear-fill',
      route: '/espace-admin/settings'
    }
  ];

  constructor(public router: Router, private translate: TranslateService) {
    this.currentLang = this.translate.currentLang || 'fr';
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  switchLanguage() {
    this.currentLang = this.currentLang === 'fr' ? 'ar' : 'fr';
    this.translate.use(this.currentLang);
    document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = this.currentLang;
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
