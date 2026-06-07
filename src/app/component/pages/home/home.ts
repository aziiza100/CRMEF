import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Actualites } from './composants/actualites/actualites';
import { BanniereDynamique } from './composants/banniere-dynamique/banniere-dynamique';
import { MessageDirecteur } from './composants/message-directeur/message-directeur';
import { PresentationCRMEF } from './composants/presentation-crmef/presentation-crmef';
import AOS from 'aos';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActualitesService } from '../../../core/services/actualites.service';
declare var PureCounter: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Actualites, BanniereDynamique, MessageDirecteur, PresentationCRMEF, RouterLink, TranslateModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, AfterViewInit {

  constructor(
    public translate: TranslateService,
    private actualitesService: ActualitesService
  ) {}

  ngOnInit(): void {
    this.actualitesService.loadActualites();
    AOS.init({
      duration: 800,
      once: true
    });
  }

  ngAfterViewInit(): void {
    AOS.refresh();
    new PureCounter();
  }

  getLatestActualites() {
    const apiActualites = this.actualitesService.publishedActualites();
    if (apiActualites && apiActualites.length > 0) {
      // Get the latest 3 published actualites
      return apiActualites.slice(0, 3).map(item => {
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

    // Default static fallback data
    return [
      {
        id: 1,
        date: '6/5/2026',
        category: 'événements',
        title: this.translate.currentLang === 'ar' ? 'تكوين عن بعد BIORENDER' : 'Formation à distance à l’usage du logiciel BIORENDER...',
        description: this.translate.currentLang === 'ar' ? 'يعتمد تعليم الإيقاظ العلمي في الابتدائي على مفاهيم مجردة...' : 'L\'enseignement d’éveil scientifique au primaire repose souvent sur des concepts abstraits...',
        image: 'assets/images/actualites/actualite1.jpg'
      },
      {
        id: 2,
        date: '6/5/2026',
        category: 'concours',
        title: 'لائحة المترشحات والمترشحين المدعويين لاجتياز الاختبارات الشفوية والعملية لمباراة التبريز تخصص المعلوميات - دورة 2026',
        description: 'يمكنكم الاطلاع على نتائج الانتقاء عبر الرابط الرسمي لوزارة التربية الوطنية.',
        image: 'assets/images/actualites/actualite2.jpg'
      },
      {
        id: 3,
        date: '4/5/2026',
        category: 'événements',
        title: 'المعرض الدولي للنشر والكتاب (SIEL)',
        description: 'يشهد المعرض الدولي للنشر والكتاب (SIEL) في دورته الـ31 بالرباط، المنعقد في الفترة من 30 أبريل إلى 10 مايو 2026...',
        image: 'assets/images/actualites/actualite3.jpg'
      }
    ];
  }
}