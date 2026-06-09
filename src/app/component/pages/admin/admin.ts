import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../../core/services/api.service';
import { SearchService } from '../../../core/services/search.service';

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
      route: '/espace-admin/dashboard',
      labelFr: 'Tableau de bord',
      labelAr: 'لوحة القيادة'
    },
    {
      id: 'users',
      icon: 'bi-people-fill',
      route: '/espace-admin/users',
      labelFr: 'Gestion Utilisateurs',
      labelAr: 'إدارة المستخدمين'
    },
    {
      id: 'classes',
      icon: 'bi-diagram-3-fill',
      route: '/espace-admin/classes',
      labelFr: 'Gestion Classes',
      labelAr: 'إدارة الأقسام'
    },
    {
      id: 'filieres',
      icon: 'bi-bookmarks-fill',
      route: '/espace-admin/filieres',
      labelFr: 'Gestion Filières',
      labelAr: 'إدارة الشعب'
    },
    {
      id: 'formations',
      icon: 'bi-journal-bookmark-fill',
      route: '/espace-admin/formations',
      labelFr: 'Gestion Formations',
      labelAr: 'إدارة التكوينات'
    },
    {
      id: 'modules',
      icon: 'bi-layers-fill',
      route: '/espace-admin/modules',
      labelFr: 'Gestion Modules',
      labelAr: 'إدارة الوحدات'
    },
    {
      id: 'content',
      icon: 'bi-newspaper',
      route: '/espace-admin/content',
      labelFr: 'Contenu',
      labelAr: 'المحتوى'
    },
    {
      id: 'emploi',
      icon: 'bi-calendar3',
      route: '/espace-admin/emploi',
      labelFr: 'Emploi du temps',
      labelAr: 'الجدول الزمني'
    },
    {
      id: 'messages',
      icon: 'bi-envelope',
      route: '/espace-admin/messages',
      labelFr: 'Messages',
      labelAr: 'الرسائل'
    },
    {
      id: 'settings',
      icon: 'bi-gear-fill',
      route: '/espace-admin/settings',
      labelFr: 'Paramètres',
      labelAr: 'الإعدادات'
    }
  ];

  constructor(public router: Router, private translate: TranslateService, private api: ApiService, private searchService: SearchService) {
    const savedLang = localStorage.getItem('lang') || 'fr';
    this.currentLang = savedLang;
    this.translate.use(this.currentLang);
    document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = this.currentLang;
  }

  onSearchInput(event: any) {
    this.searchService.updateSearch(event.target.value);
  }

  prefetch(item: any) {
    // Only prefetch filieres or formations data to speed up first navigation to that page
    try {
      if (item && item.id === 'filieres') {
        this.api.getFilieres().subscribe({ next: () => {}, error: () => {} });
      }
      if (item && item.id === 'formations') {
        this.api.getFormations().subscribe({ next: () => {}, error: () => {} });
      }
    } catch (e) {
      // swallow errors; prefetch is optional
    }
  }

  onNavItemClick(item: any) {
    this.prefetch(item);
    if (item && item.id === 'content') {
      window.dispatchEvent(new CustomEvent('admin-reset-content-tab'));
    }
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

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  switchLanguage() {
    this.currentLang = this.currentLang === 'fr' ? 'ar' : 'fr';
    this.translate.use(this.currentLang);
    document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = this.currentLang;
    localStorage.setItem('lang', this.currentLang);
  }
}

