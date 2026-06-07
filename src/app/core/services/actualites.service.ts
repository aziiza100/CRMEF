import { Injectable, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiService, Actualite } from './api.service';

// Mock data for when API is unavailable
const MOCK_ACTUALITES: Actualite[] = [
  {
    id: 1,
    titre: 'Formation à distance BIORENDER ||| تكوين عن بعد BIORENDER',
    description: 'L\'enseignement d\'éveil scientifique au primaire repose souvent sur des concepts abstraits que les jeunes apprenants peinent à visualiser sans support adéquat... ||| يعتمد تعليم الإيقاظ العلمي في الابتدائي على مفاهيم مجردة وغالباً ما يصعب على المتعلمين الصغار تصورها بدون دعم مناسب...',
    type: 'evenements',
    date: '2026-05-06',
    image_url: 'assets/images/actualites/actualite1.jpg',
    is_published: true
  },
  {
    id: 2,
    titre: 'Concours Agrégation Informatique 2026 ||| لائحة المترشحات والمترشحين المدعويين لاجtياز الاختبارات الشفوية والعملية لمباراة التبريز تخصص المعلوميات - دورة 2026',
    description: 'Liste des candidats convoqués aux épreuves orales et pratiques du concours d\'agrégation. ||| يمكنكم الاطلاع على نتائج الانتقاء عبر الرابط الرسمي لوزارة التربية الوطنية.',
    type: 'actualites',
    date: '2026-05-06',
    image_url: 'assets/images/actualites/actualite2.jpg',
    is_published: true
  },
  {
    id: 3,
    titre: 'Participation au Salon International du Livre ||| المعرض الدولي للنشر والكتاب (SIEL)',
    description: 'Les professeurs-chercheurs du CRMEF participent au SIEL 2026 à Rabat. ||| يشهد المعرض الدولي للنشر والكتاب (SIEL) في دورته الـ31 بالرباط، المنعقد في الفترة من 30 أبريل إلى 10 مايو 2026، مشاركة وازنة وقوية للأساتذة المكونين والباحثين بالمركز الجهوي لمهن التربية والتكوين لجهة مراكش - آسفي.',
    type: 'evenements',
    date: '2026-05-04',
    image_url: 'assets/images/actualites/actualite3.jpg',
    is_published: true
  }
];

@Injectable({
  providedIn: 'root'
})
export class ActualitesService {
  // Reactive signals for state management
  private _actualites = signal<Actualite[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _useApi = signal<boolean>(true);

  // Public computed signals
  actualites = computed(() => this._actualites());
  loading = computed(() => this._loading());
  error = computed(() => this._error());
  publishedActualites = computed(() => 
    this._actualites().filter(a => {
      const p = a.publie as any;
      return p === undefined || p === null || (p !== false && p !== 0 && p !== '0');
    })
  );

  constructor(private api: ApiService) {}

  /**
   * Load actualités - tries API first, falls back to mock data
   */
  loadActualites(): void {
    this._loading.set(true);
    this._error.set(null);

    this.api.getActualites().pipe(
      map(response => response.data),
      catchError(err => {
        console.warn('[ActualitesService] API unavailable, using mock data:', err.message);
        this._useApi.set(false);
        return of(MOCK_ACTUALITES);
      })
    ).subscribe({
      next: (data) => {
        this._actualites.set(data);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err.message);
        this._actualites.set(MOCK_ACTUALITES);
        this._loading.set(false);
      }
    });
  }

  /**
   * Get latest N actualités for homepage
   */
  getLatest(count: number = 3): Actualite[] {
    return this.publishedActualites().slice(0, count);
  }

  /**
   * Get actualités by category
   */
  getByCategory(type: string): Actualite[] {
    return this.publishedActualites().filter(a => a.type === type);
  }

  /**
   * Check if using API or mock data
   */
  isUsingApi(): boolean {
    return this._useApi();
  }
}
