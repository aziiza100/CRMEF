import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Actualite {
  id?: number;
  titre_fr: string;
  titre_ar: string;
  description_fr: string;
  description_ar: string;
  categorie: string;
  date: string;
  image_url?: string;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Formation {
  id?: number;
  titre_fr: string;
  titre_ar: string;
  type: 'primaire' | 'secondaire' | 'qualifiante';
  volume_horaire: number;
  description_fr: string;
  description_ar: string;
  syllabus_json?: any;
  objectifs_json?: any;
  debouches_json?: any;
  is_published: boolean;
}

export interface SiteContent {
  section: string;
  key: string;
  value_fr: string;
  value_ar: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface DashboardStats {
  total_actualites: number;
  total_formations: number;
  total_contents: number;
  last_update: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;
  private tokenKey = 'crmef_admin_token';
  
  // Auth state
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ============================================================
  // AUTH HELPERS
  // ============================================================
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.tokenKey);
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.isAuthenticatedSubject.next(true);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticatedSubject.next(false);
  }

  // ============================================================
  // AUTH
  // ============================================================
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, { email, password }).pipe(
      tap(response => {
        if (response.success && response.token) {
          this.saveToken(response.token);
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/logout`, {}, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.clearToken()),
      catchError(this.handleError)
    );
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/me`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  // ============================================================
  // DASHBOARD
  // ============================================================
  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.baseUrl}/dashboard/stats`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  // ============================================================
  // ACTUALITÉS
  // ============================================================
  getActualites(): Observable<ApiResponse<Actualite[]>> {
    return this.http.get<ApiResponse<Actualite[]>>(`${this.baseUrl}/actualites`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  getActualiteById(id: number): Observable<ApiResponse<Actualite>> {
    return this.http.get<ApiResponse<Actualite>>(`${this.baseUrl}/actualites/${id}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  createActualite(data: Partial<Actualite>): Observable<ApiResponse<Actualite>> {
    return this.http.post<ApiResponse<Actualite>>(`${this.baseUrl}/actualites`, data, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  updateActualite(id: number, data: Partial<Actualite>): Observable<ApiResponse<Actualite>> {
    return this.http.put<ApiResponse<Actualite>>(`${this.baseUrl}/actualites/${id}`, data, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  deleteActualite(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/actualites/${id}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  // ============================================================
  // FORMATIONS
  // ============================================================
  getFormations(): Observable<ApiResponse<Formation[]>> {
    return this.http.get<ApiResponse<Formation[]>>(`${this.baseUrl}/formations`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  getFormationByType(type: string): Observable<ApiResponse<Formation>> {
    return this.http.get<ApiResponse<Formation>>(`${this.baseUrl}/formations?type=${type}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  updateFormation(id: number, data: Partial<Formation>): Observable<ApiResponse<Formation>> {
    return this.http.put<ApiResponse<Formation>>(`${this.baseUrl}/formations/${id}`, data, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  // ============================================================
  // SITE CONTENT
  // ============================================================
  getAllContent(): Observable<ApiResponse<SiteContent[]>> {
    return this.http.get<ApiResponse<SiteContent[]>>(`${this.baseUrl}/content`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  getContentBySection(section: string): Observable<ApiResponse<SiteContent[]>> {
    return this.http.get<ApiResponse<SiteContent[]>>(`${this.baseUrl}/content/${section}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  updateContent(section: string, data: Partial<SiteContent>[]): Observable<ApiResponse<SiteContent[]>> {
    return this.http.put<ApiResponse<SiteContent[]>>(`${this.baseUrl}/content/${section}`, { items: data }, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  // ============================================================
  // TRANSLATIONS
  // ============================================================
  getTranslations(lang: 'fr' | 'ar'): Observable<any> {
    return this.http.get(`${this.baseUrl}/translations/${lang}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  updateTranslations(lang: 'fr' | 'ar', data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/translations/${lang}`, { translations: data }, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  // ============================================================
  // MEDIA
  // ============================================================
  uploadMedia(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    const token = localStorage.getItem(this.tokenKey);
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
    return this.http.post(`${this.baseUrl}/media/upload`, formData, { headers })
      .pipe(catchError(this.handleError));
  }

  getMedia(): Observable<any> {
    return this.http.get(`${this.baseUrl}/media`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  deleteMedia(filename: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/media/${filename}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  // ============================================================
  // ERROR HANDLER
  // ============================================================
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Une erreur est survenue';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      localStorage.removeItem('crmef_admin_token');
    } else if (error.status === 403) {
      errorMessage = 'Accès non autorisé.';
    } else if (error.status === 404) {
      errorMessage = 'Ressource introuvable.';
    } else if (error.status === 422) {
      errorMessage = 'Données invalides.';
    } else if (error.status === 0) {
      errorMessage = 'Impossible de contacter le serveur. Vérifiez que Laravel est démarré.';
    }
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
