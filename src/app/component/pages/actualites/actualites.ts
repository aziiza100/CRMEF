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
  
  announcements: Announcement[] = [
    {
      id: 1,
      date: '2026-06-01',
      icon: 'bi-megaphone',
      title: 'Ouverture des inscriptions - Formations 2026/2027',
      description: 'Les inscriptions pour les programmes de formation 2026/2027 sont désormais ouvertes. Consultez les critères d\'admission et les modalités de candidature.',
      category: 'Inscription',
      image: 'assets/images/actualites/actualite1.jpg'
    },
    {
      id: 2,
      date: '2026-05-25',
      icon: 'bi-book',
      title: 'Nouvelle plateforme d\'e-learning disponible',
      description: 'Accédez à la nouvelle plateforme numérique du CRMEF avec des ressources pédagogiques enrichies et des outils de collaboration.',
      category: 'Ressources',
      image: 'assets/images/actualites/actualite2.jpg'
    },
    {
      id: 3,
      date: '2026-05-20',
      icon: 'bi-star',
      title: 'Prix d\'excellence - Appel à candidatures',
      description: 'Le CRMEF lance son programme de reconnaissance d\'excellence. Les candidatures sont acceptées jusqu\'au 30 juin 2026.',
      category: 'Reconnaissance',
      image: 'assets/images/actualites/actualite3.jpg'
    },
    {
      id: 4,
      date: '2026-05-15',
      icon: 'bi-briefcase',
      title: 'Partenariat stratégique avec l\'Université de Marrakech',
      description: 'Signature d\'un accord de partenariat pour renforcer la recherche pédagogique et l\'innovation éducative.',
      category: 'Partenariat',
      image: 'assets/images/actualites/actualite1.jpg'
    }
  ];

  events: CalendarEvent[] = [
    {
      id: 1,
      date: '2026-06-15',
      time: '09:00',
      icon: 'bi-calendar-event',
      title: 'Cérémonie de remise des diplômes - Promotion 2025/2026',
      location: 'Amphithéâtre central du CRMEF',
      description: 'Célébration de fin d\'année et remise des diplômes aux nouveaux enseignants formés.',
      category: 'Cérémonie',
      image: 'assets/images/actualites/actualite2.jpg'
    },
    {
      id: 2,
      date: '2026-06-22',
      time: '14:00',
      icon: 'bi-people',
      title: 'Journée Portes Ouvertes',
      location: 'Campus principal',
      description: 'Venez découvrir nos installations, rencontrer nos formateurs et en savoir plus sur nos programmes.',
      category: 'Campus',
      image: 'assets/images/actualites/actualite3.jpg'
    },
    {
      id: 3,
      date: '2026-07-05',
      time: '10:00',
      icon: 'bi-trophy',
      title: 'Concours d\'Innovation Pédagogique',
      location: 'Salle de conférence',
      description: 'Compétition nationale pour récompenser les meilleures initiatives pédagogiques innovantes.',
      category: 'Concours',
      image: 'assets/images/actualites/actualite1.jpg'
    },
    {
      id: 4,
      date: '2026-08-10',
      time: '09:30',
      icon: 'bi-calendar-event',
      title: 'Rentrée académique 2026/2027',
      location: 'Tout le campus',
      description: 'Accueil de la nouvelle promotion d\'étudiants en formation initiale.',
      category: 'Académique',
      image: 'assets/images/actualites/actualite2.jpg'
    }
  ];

  seminars: Seminar[] = [
    {
      id: 1,
      date: '2026-06-08',
      time: '15:00',
      icon: 'bi-mic',
      title: 'Pédagogie Active et Apprentissage Collaboratif',
      speaker: 'Pr. Ahmed Bennani',
      location: 'Salle des conférences A',
      description: 'Découvrez les dernières approches pédagogiques pour encourager l\'engagement et la collaboration entre apprenants.',
      category: 'Pédagogie',
      image: 'assets/images/actualites/actualite3.jpg'
    },
    {
      id: 2,
      date: '2026-06-12',
      time: '13:30',
      icon: 'bi-laptop',
      title: 'Intégration des TIC dans l\'Enseignement',
      speaker: 'Dr. Fatima Zahra Youssefi',
      location: 'Laboratoire informatique',
      description: 'Session pratique sur l\'utilisation des outils numériques pour enrichir l\'expérience pédagogique.',
      category: 'Numérique',
      image: 'assets/images/actualites/actualite1.jpg'
    },
    {
      id: 3,
      date: '2026-06-19',
      time: '10:00',
      icon: 'bi-heart',
      title: 'Santé Mentale et Bien-être des Enseignants',
      speaker: 'Pr. Mohamed Amine Khalid',
      location: 'Amphithéâtre principal',
      description: 'Conférence sur la gestion du stress et l\'amélioration du bien-être en contexte scolaire.',
      category: 'Bien-être',
      image: 'assets/images/actualites/actualite2.jpg'
    },
    {
      id: 4,
      date: '2026-06-26',
      time: '14:00',
      icon: 'bi-globe',
      title: 'Éducation Inclusive et Diversité',
      speaker: 'Pr. Khadija Al-Mansouri',
      location: 'Salle des conférences B',
      description: 'Stratégies pour créer des environnements d\'apprentissage inclusifs et accessibles à tous.',
      category: 'Inclusion',
      image: 'assets/images/actualites/actualite3.jpg'
    }
  ];

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

    // Fallback to local mock data
    const tab = this.activeTabSignal();
    if (tab === 'all') {
      return [...this.announcements, ...this.events, ...this.seminars];
    } else if (tab === 'announcements') {
      return this.announcements;
    } else if (tab === 'events') {
      return this.events;
    } else if (tab === 'seminars') {
      return this.seminars;
    }
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

