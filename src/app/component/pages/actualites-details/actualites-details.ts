import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActualitesService } from '../../../core/services/actualites.service';
import { ApiService, Actualite } from '../../../core/services/api.service';

@Component({
  selector: 'app-actualites-details',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './actualites-details.html',
  styleUrls: ['./actualites-details.css']
})
export class ActualitesDetailsComponent implements OnInit {
  actualite: Actualite | undefined;
  formattedDate: string = '';
  category: string = '';
  title: string = '';
  description: string = '';
  image: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private actualitesService: ActualitesService,
    private apiService: ApiService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadDetails(id);
      } else {
        this.router.navigate(['/actualites']);
      }
    });
  }

  loadDetails(id: string) {
    this.apiService.getActualiteById(Number(id)).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.actualite = response.data;
          this.formatData();
        } else {
          console.error('Actualite not found for id:', id);
          this.router.navigate(['/actualites']);
        }
      },
      error: (err) => {
        console.error('Error fetching actualite details:', err);
        this.router.navigate(['/actualites']);
      }
    });
  }

  formatData() {
    if (!this.actualite) return;

    const item = this.actualite;
    
    // Parse titles and descriptions
    const titreParts = item.titre ? item.titre.split(' ||| ') : ['', ''];
    const descParts = item.description ? item.description.split(' ||| ') : ['', ''];
    
    const titleAr = (item as any).titre_arabe || titreParts[1] || titreParts[0];
    const titleFr = item.titre || titreParts[0];
    
    const descAr = (item as any).description_arabe || descParts[1] || descParts[0];
    const descFr = item.description || descParts[0];

    this.title = this.translate.currentLang === 'ar' ? titleAr : titleFr;
    this.description = this.translate.currentLang === 'ar' ? descAr : descFr;
    
    this.category = item.type === 'annonces' ? 'Annonce' : (item.type === 'evenements' ? 'Événement' : 'Séminaire');
    
    // Date formatting
    if (item.date) {
      const d = new Date(item.date);
      this.formattedDate = !isNaN(d.getTime()) ? d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) : item.date;
    }

    this.image = (item as any).image_base64 || item.image_url || 'assets/images/actualites/actualite1.jpg';
  }
}
