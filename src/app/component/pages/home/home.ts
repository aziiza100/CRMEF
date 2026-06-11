import { Component, OnInit, AfterViewInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import AOS from 'aos';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActualitesService } from '../../../core/services/actualites.service';
declare var PureCounter: any;
declare var bootstrap: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, AfterViewInit {

  constructor(
    public translate: TranslateService,
    private actualitesService: ActualitesService
  ) {
    // Initialize carousel automatically when actualites data arrives
    effect(() => {
      const news = this.latestActualites();
      if (news.length > 0) {
        setTimeout(() => {
          const carouselElement = document.getElementById('heroCarousel');
          if (carouselElement && typeof bootstrap !== 'undefined') {
            new bootstrap.Carousel(carouselElement, {
              interval: 5000,
              ride: 'carousel',
              wrap: true
            });
          }
        }, 100);
      }
    });
  }

  ngOnInit(): void {
    this.actualitesService.loadActualites();
    AOS.init({
      duration: 800,
      once: true
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      AOS.refresh();
      new PureCounter();
    }, 100);
  }

  latestActualites = computed(() => {
    const apiActualites = this.actualitesService.publishedActualites();
    if (apiActualites && apiActualites.length > 0) {
      // Get the latest 10 published actualites
      return apiActualites.slice(0, 10).map((item: any) => {
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
          titleFr: titleFr,
          titleAr: titleAr,
          descFr: descFr,
          descAr: descAr,
          image: item.image_base64 || 'assets/images/actualites/actualite1.jpg'
        };
      });
    }

    return [];
  });
}