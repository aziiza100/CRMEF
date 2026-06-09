import { Component, OnInit, AfterViewInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActualitesService } from '../../../core/services/actualites.service';
import AOS from 'aos';

interface Announcement {
  id: number;
  date: string;
  icon: string;
  title: string;
  description: string;
  category: string;
  image: string;
}

interface CalendarEvent {
  id: number;
  date: string;
  time: string;
  icon: string;
  title: string;
  location: string;
  description: string;
  category: string;
  image: string;
}

interface Seminar {
  id: number;
  date: string;
  time: string;
  icon: string;
  title: string;
  speaker: string;
  location: string;
  description: string;
  category: string;
  image: string;
}

@Component({
  selector: 'app-actualites',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './actualites.html',
  styleUrls: ['./actualites.css']
})
export class ActualitesComponent implements OnInit, AfterViewInit {
  activeTabSignal = signal('all');

  get activeTab() {
    return this.activeTabSignal();
  }

  set activeTab(val: string) {
    this.activeTabSignal.set(val);
  }

  constructor(
    public translate: TranslateService,
    private actualitesService: ActualitesService
  ) {}

  ngOnInit(): void {
    this.actualitesService.loadActualites();
    // Animations au chargement
    AOS.init({ once: true });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      AOS.refresh();
    }, 100);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  filteredItems = computed(() => {
    // If we have actualites loaded from the service/API, use them
    const apiActualites = this.actualitesService.publishedActualites();
    if (apiActualites && apiActualites.length > 0) {
      return apiActualites.filter(item => {
        // Map database "type" to UI tabs
        const tab = this.activeTabSignal();
        if (tab === 'all') return true;
        if (tab === 'announcements') return item.type === 'annonces';
        if (tab === 'events') return item.type === 'evenements';
        if (tab === 'seminars') return item.type === 'actualites';
        return true;
      }).map((item: any) => {
        const titreParts = item.titre ? item.titre.split(' ||| ') : ['', ''];
        const descParts = item.description ? item.description.split(' ||| ') : ['', ''];
        
        const titleAr = item.titre_arabe || titreParts[1] || titreParts[0];
        const titleFr = item.titre || titreParts[0];
        
        const descAr = item.description_arabe || descParts[1] || descParts[0];
        const descFr = item.description || descParts[0];

        return {
          id: item.id,
          date: item.date,
          category: item.type === 'annonces' ? 'Annonce' : (item.type === 'evenements' ? 'Événement' : 'Séminaire'),
          title: this.translate.currentLang === 'ar' ? titleAr : titleFr,
          description: this.translate.currentLang === 'ar' ? descAr : descFr,
          image: item.image_base64 || 'assets/images/actualites/actualite1.jpg'
        };
      });
    }

    // No fallback, only return backend data (or empty array if none)
    return [];
  });

  getIconClass(item: any): string {
    if ('speaker' in item) return 'icon-seminar';
    if ('location' in item && 'time' in item) return 'icon-event';
    return 'icon-announcement';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('fr-FR', options);
  }

  
}

