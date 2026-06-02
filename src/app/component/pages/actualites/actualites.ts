import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface Announcement {
  id: number;
  date: string;
  icon: string;
  title: string;
  description: string;
  category: string;
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
}

@Component({
  selector: 'app-actualites',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './actualites.html',
  styleUrls: ['./actualites.css']
})
export class ActualitesComponent implements OnInit {
  activeTab: string = 'all';
  
  announcements: Announcement[] = [
    {
      id: 1,
      date: '2026-06-01',
      icon: 'bi-megaphone',
      title: 'Ouverture des inscriptions - Formations 2026/2027',
      description: 'Les inscriptions pour les programmes de formation 2026/2027 sont désormais ouvertes. Consultez les critères d\'admission et les modalités de candidature.',
      category: 'Inscription'
    },
    {
      id: 2,
      date: '2026-05-25',
      icon: 'bi-book',
      title: 'Nouvelle plateforme d\'e-learning disponible',
      description: 'Accédez à la nouvelle plateforme numérique du CRMEF avec des ressources pédagogiques enrichies et des outils de collaboration.',
      category: 'Ressources'
    },
    {
      id: 3,
      date: '2026-05-20',
      icon: 'bi-star',
      title: 'Prix d\'excellence - Appel à candidatures',
      description: 'Le CRMEF lance son programme de reconnaissance d\'excellence. Les candidatures sont acceptées jusqu\'au 30 juin 2026.',
      category: 'Reconnaissance'
    },
    {
      id: 4,
      date: '2026-05-15',
      icon: 'bi-briefcase',
      title: 'Partenariat stratégique avec l\'Université de Marrakech',
      description: 'Signature d\'un accord de partenariat pour renforcer la recherche pédagogique et l\'innovation éducative.',
      category: 'Partenariat'
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
      category: 'Cérémonie'
    },
    {
      id: 2,
      date: '2026-06-22',
      time: '14:00',
      icon: 'bi-people',
      title: 'Journée Portes Ouvertes',
      location: 'Campus principal',
      description: 'Venez découvrir nos installations, rencontrer nos formateurs et en savoir plus sur nos programmes.',
      category: 'Campus'
    },
    {
      id: 3,
      date: '2026-07-05',
      time: '10:00',
      icon: 'bi-trophy',
      title: 'Concours d\'Innovation Pédagogique',
      location: 'Salle de conférence',
      description: 'Compétition nationale pour récompenser les meilleures initiatives pédagogiques innovantes.',
      category: 'Concours'
    },
    {
      id: 4,
      date: '2026-08-10',
      time: '09:30',
      icon: 'bi-calendar-event',
      title: 'Rentrée académique 2026/2027',
      location: 'Tout le campus',
      description: 'Accueil de la nouvelle promotion d\'étudiants en formation initiale.',
      category: 'Académique'
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
      category: 'Pédagogie'
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
      category: 'Numérique'
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
      category: 'Bien-être'
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
      category: 'Inclusion'
    }
  ];

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    // Animations au chargement
    if (typeof AOS !== 'undefined') {
      AOS.init();
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getFilteredItems(): (Announcement | CalendarEvent | Seminar)[] {
    if (this.activeTab === 'all') {
      return [...this.announcements, ...this.events, ...this.seminars];
    } else if (this.activeTab === 'announcements') {
      return this.announcements;
    } else if (this.activeTab === 'events') {
      return this.events;
    } else if (this.activeTab === 'seminars') {
      return this.seminars;
    }
    return [];
  }

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

  onSubscribe(): void {
    // Handle subscription
    console.log('Subscribe clicked');
  }
}

declare var AOS: any;
