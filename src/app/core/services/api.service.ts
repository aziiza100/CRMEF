import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, tap, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Actualite {
  id?: number;
  date: string;
  heure?: string;
  type: string;
  description: string;
  titre: string;
  titre_arabe?: string;
  description_arabe?: string;
  publie?: boolean;
  image_data?: string;
  image_mime?: string;
  image_base64?: string;
  image_url?: string;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Formation {
  id?: number;
  titre_fr: string;
  titre_ar: string;
  type?: string;
  volume_horaire: number;
  description?: string;
  description_fr: string;
  description_ar: string;
  duree?: string;
  condition_acces?: string;
  syllabus_json?: any;
  objectifs_json?: any;
  debouches_json?: any;
  is_published: boolean;
  filieres?: Filiere[];
}

export interface Filiere {
  id?: number;
  nom: string;
  niveau?: string;
  description?: string;
  formations?: Formation[];
}

export interface Module {
  id?: number;
  nom: string;
  masse_horraire: number;
  filieres?: Filiere[];
  classes?: any[];
  enseignant_id?: number;
  enseignant?: any;
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
  message?: string;
  token?: string;
  user?: any;
}

export interface DashboardStats {
  stats: {
    etudiants: number;
    profs: number;
    classes: number;
    filieres: number;
  };
  recentActivities: {
    type: string;
    message: string;
    time: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;
  private tokenKey = 'crmef_admin_token';
  private userRole: string | null = null;
  
  // Auth state
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // ============================================================
  // CACHES (RxJS shareReplay)
  // ============================================================
  private dashboardCache$: Observable<DashboardStats> | null = null;
  private actualitesCache$: Observable<ApiResponse<Actualite[]>> | null = null;
  private filieresCache$: Observable<Filiere[]> | null = null;
  private adminStudentsCache$: Observable<any[]> | null = null;
  private adminClassesCache$: Observable<any[]> | null = null;
  private formationsCache$: Observable<Formation[]> | null = null;
  private adminEnseignantsCache$: Observable<any[]> | null = null;

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

  private getFormHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.tokenKey);
    return new HttpHeaders({
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
    this.userRole = null;
    this.isAuthenticatedSubject.next(false);
  }

  setUserRole(role: string): void {
    this.userRole = role;
  }

  getUserRole(): string | null {
    return this.userRole;
  }

  // ============================================================
  // AUTH
  // ============================================================
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { email, password }).pipe(
      tap(response => {
        if (response.token) {
          this.saveToken(response.token as string);
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {}, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.clearToken()),
      catchError(this.handleError)
    );
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.baseUrl}/user`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email }, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  resetPassword(email: string, token: string, password: string, password_confirmation: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, {
      email,
      token,
      password,
      password_confirmation
    }, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  // ============================================================
  // DASHBOARD
  // ============================================================
  getDashboardStats(): Observable<DashboardStats> {
    if (!this.dashboardCache$) {
      this.dashboardCache$ = this.http.get<DashboardStats>(`${this.baseUrl}/admin`, {
        headers: this.getHeaders()
      }).pipe(
        shareReplay(1),
        catchError(this.handleError)
      );
    }
    return this.dashboardCache$;
  }

  // ============================================================
  // ACTUALITÉS
  // ============================================================
  getActualites(): Observable<ApiResponse<Actualite[]>> {
    if (!this.actualitesCache$) {
      this.actualitesCache$ = this.http.get<ApiResponse<Actualite[]>>(`${this.baseUrl}/actualites`, {
        headers: this.getHeaders()
      }).pipe(
        shareReplay(1),
        catchError(this.handleError)
      );
    }
    return this.actualitesCache$;
  }

  getActualiteById(id: number): Observable<ApiResponse<Actualite>> {
    return this.http.get<ApiResponse<Actualite>>(`${this.baseUrl}/admin/actualites/${id}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  createActualite(data: any): Observable<ApiResponse<Actualite>> {
    const headers = data instanceof FormData ? this.getFormHeaders() : this.getHeaders();
    return this.http.post<ApiResponse<Actualite>>(`${this.baseUrl}/admin/actualites`, data, {
      headers
    }).pipe(
      tap(() => { this.actualitesCache$ = null; this.dashboardCache$ = null; }),
      catchError(this.handleError)
    );
  }

  updateActualite(id: number, data: any): Observable<ApiResponse<Actualite>> {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      const headers = this.getFormHeaders();
      return this.http.post<ApiResponse<Actualite>>(`${this.baseUrl}/admin/actualites/${id}`, data, {
        headers
      }).pipe(catchError(this.handleError));
    }

    const headers = this.getHeaders();
    return this.http.put<ApiResponse<Actualite>>(`${this.baseUrl}/admin/actualites/${id}`, data, {
      headers
    }).pipe(
      tap(() => { this.actualitesCache$ = null; this.dashboardCache$ = null; }),
      catchError(this.handleError)
    );
  }

  deleteActualite(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/admin/actualites/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => { this.actualitesCache$ = null; this.dashboardCache$ = null; }),
      catchError(this.handleError)
    );
  }

  // ============================================================
  // FILIÈRES
  // ============================================================
  getFilieres(): Observable<Filiere[]> {
    if (!this.filieresCache$) {
      this.filieresCache$ = this.http.get<Filiere[]>(`${this.baseUrl}/admin/filieres`, {
        headers: this.getHeaders()
      }).pipe(
        shareReplay(1),
        catchError(this.handleError)
      );
    }
    return this.filieresCache$;
  }

  getFiliere(id: number): Observable<Filiere> {
    return this.http.get<Filiere>(`${this.baseUrl}/admin/filieres/${id}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  createFiliere(data: Partial<Filiere> & { formation_ids?: number[] }): Observable<Filiere> {
    return this.http.post<Filiere>(`${this.baseUrl}/admin/filieres`, data, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => { this.filieresCache$ = null; this.dashboardCache$ = null; }),
      catchError(this.handleError)
    );
  }

  updateFiliere(id: number, data: Partial<Filiere> & { formation_ids?: number[] }): Observable<Filiere> {
    return this.http.put<Filiere>(`${this.baseUrl}/admin/filieres/${id}`, data, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => { this.filieresCache$ = null; this.dashboardCache$ = null; }),
      catchError(this.handleError)
    );
  }

  deleteFiliere(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/admin/filieres/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => { this.filieresCache$ = null; this.dashboardCache$ = null; }),
      catchError(this.handleError)
    );
  }

  getAdminStudents(): Observable<any[]> {
    if (!this.adminStudentsCache$) {
      this.adminStudentsCache$ = this.http.get<any[]>(`${this.baseUrl}/admin/students`, {
        headers: this.getHeaders()
      }).pipe(
        shareReplay(1),
        catchError(this.handleError)
      );
    }
    return this.adminStudentsCache$;
  }

  createAdminStudent(data: any): Observable<any> {
    const headers = data instanceof FormData ? this.getFormHeaders() : this.getHeaders();
    return this.http.post<any>(`${this.baseUrl}/admin/students`, data, {
      headers
    }).pipe(
      tap(() => { this.adminStudentsCache$ = null; this.dashboardCache$ = null; }),
      catchError(this.handleError)
    );
  }

  importAdminStudents(users: any[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/admin/students/import`, { users }, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => { this.adminStudentsCache$ = null; this.dashboardCache$ = null; }),
      catchError(this.handleError)
    );
  }

  updateAdminStudent(id: number, data: any): Observable<any> {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      const headers = this.getFormHeaders();
      return this.http.post<any>(`${this.baseUrl}/admin/students/${id}`, data, {
        headers
      }).pipe(catchError(this.handleError));
    }

    const headers = this.getHeaders();
    return this.http.put<any>(`${this.baseUrl}/admin/students/${id}`, data, {
      headers
    }).pipe(
      tap(() => { this.adminStudentsCache$ = null; this.dashboardCache$ = null; }),
      catchError(this.handleError)
    );
  }

  deleteAdminStudent(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/admin/students/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => { this.adminStudentsCache$ = null; this.dashboardCache$ = null; }),
      catchError(this.handleError)
    );
  }

  getAdminClasses(): Observable<any[]> {
    if (!this.adminClassesCache$) {
      this.adminClassesCache$ = this.http.get<any[]>(`${this.baseUrl}/admin/classes`, {
        headers: this.getHeaders()
      }).pipe(
        shareReplay(1),
        catchError(this.handleError)
      );
    }
    return this.adminClassesCache$;
  }

  getAdminClass(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/classes/${id}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  createAdminClass(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/admin/classes`, data, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => { this.adminClassesCache$ = null; this.dashboardCache$ = null; }),
      catchError(this.handleError)
    );
  }

  updateAdminClass(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/admin/classes/${id}`, data, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => { this.adminClassesCache$ = null; this.dashboardCache$ = null; }),
      catchError(this.handleError)
    );
  }

  deleteAdminClass(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/admin/classes/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => { this.adminClassesCache$ = null; this.dashboardCache$ = null; }),
      catchError(this.handleError)
    );
  }


  // ============================================================
  // FORMATIONS
  // ============================================================
  getFormations(): Observable<Formation[]> {
    if (!this.formationsCache$) {
      this.formationsCache$ = this.http.get<Formation[]>(`${this.baseUrl}/admin/formations`, {
        headers: this.getHeaders()
      }).pipe(
        shareReplay(1),
        catchError(this.handleError)
      );
    }
    return this.formationsCache$;
  }

  getFormationByType(type: string): Observable<Formation> {
    return this.http.get<Formation>(`${this.baseUrl}/admin/formations?type=${type}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  createFormation(data: Partial<Formation> & { filiere_ids?: number[] }): Observable<Formation> {
    return this.http.post<Formation>(`${this.baseUrl}/admin/formations`, data, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => { this.formationsCache$ = null; this.dashboardCache$ = null; }),
      catchError(this.handleError)
    );
  }

  updateFormation(id: number, data: Partial<Formation> & { filiere_ids?: number[] }): Observable<Formation> {
    return this.http.put<Formation>(`${this.baseUrl}/admin/formations/${id}`, data, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => { this.formationsCache$ = null; this.dashboardCache$ = null; }),
      catchError(this.handleError)
    );
  }

  deleteFormation(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/admin/formations/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => { this.formationsCache$ = null; this.dashboardCache$ = null; }),
      catchError(this.handleError)
    );
  }

  // ============================================================
  // MODULES
  getModules(): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.baseUrl}/admin/modules`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  createModule(filiereId: number, data: { nom: string; masse_horraire: number; enseignant_id: number; classe_id?: number; module_id?: number }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/admin/filieres/${filiereId}/modules`, data, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  deleteModule(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/admin/modules/${id}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  updateModule(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/admin/modules/${id}`, data, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  assignModuleToClasse(classeId: number, data: { module_id: number; id_enseignant: number }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/admin/classes/${classeId}/modules`, data, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  // ============================================================
  // EMPLOI DU TEMPS
  // ============================================================
  getEmploiForClass(classeId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/classes/${classeId}/emploi`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  getStudentEmploi(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/etudiant/emploi`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }
  
  getStudentDashboard(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/etudiant/dashboard`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

 
  // ============================================================
  // TEACHER / ENSEIGNANT
  // ============================================================
    getEnseignantDashbord(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/enseignant/dashbord`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  getEnseignantProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/enseignant`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  updateEnseignantProfile(data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/enseignant`, data, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  updateEnseignantPassword(currentPassword: string, password: string, passwordConfirmation: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/enseignant/password`, {
      current_password: currentPassword,
      password,
      password_confirmation: passwordConfirmation
    }, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  getAdminEnseignants(): Observable<any[]> {
    if (!this.adminEnseignantsCache$) {
      this.adminEnseignantsCache$ = this.http.get<any[]>(`${this.baseUrl}/admin/enseignants`, {
        headers: this.getHeaders()
      }).pipe(
        shareReplay(1),
        catchError(this.handleError)
      );
    }
    return this.adminEnseignantsCache$;
  }
  
  

  createAdminEnseignant(data: any): Observable<any> {
    const headers = data instanceof FormData ? this.getFormHeaders() : this.getHeaders();
    return this.http.post<any>(`${this.baseUrl}/admin/enseignants`, data, {
      headers
    }).pipe(
      tap(() => { this.adminEnseignantsCache$ = null; this.dashboardCache$ = null; }),
      catchError(this.handleError)
    );
  }

  importAdminEnseignants(users: any[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/admin/enseignants/import`, { users }, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => { this.adminEnseignantsCache$ = null; this.dashboardCache$ = null; }),
      catchError(this.handleError)
    );
  }

  updateAdminEnseignant(id: number, data: any): Observable<any> {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      const headers = this.getFormHeaders();
      return this.http.post<any>(`${this.baseUrl}/admin/enseignants/${id}`, data, {
        headers
      }).pipe(catchError(this.handleError));
    }

    const headers = this.getHeaders();
    return this.http.put<any>(`${this.baseUrl}/admin/enseignants/${id}`, data, {
      headers
    }).pipe(
      tap(() => { this.adminEnseignantsCache$ = null; this.dashboardCache$ = null; }),
      catchError(this.handleError)
    );
  }

  deleteAdminEnseignant(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/admin/enseignants/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => { this.adminEnseignantsCache$ = null; this.dashboardCache$ = null; }),
      catchError(this.handleError)
    );
  }

getEnseignantClasses(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/enseignant/classes`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}
  

  getEnseignantClass(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/enseignant/classes/${id}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }
getEnseignantEmploiForClass(classeId: number): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/enseignant/classes/${classeId}/emploi`, {
    headers: this.getHeaders()
  }).pipe(catchError(this.handleError));
}
// ============================================================
// crud d'une seance
// ============================================================

updateSeance(seanceId: number, payload: any): Observable<any> {
  const role = localStorage.getItem('crmef_user_role'); 
  
  const url =  `${this.baseUrl}/admin/emploi/${seanceId}`; 

  return this.http.put<any>(url, payload, { headers: this.getHeaders() });
}
createSeance(classeId: number, payload: any): Observable<any> {
  const role = localStorage.getItem('crmef_user_role'); 
  const url = `${this.baseUrl}/admin/classes/${classeId}/emploi`; 

  return this.http.post<any>(url, payload, { headers: this.getHeaders() });
}
deleteSeance(seanceId: number): Observable<any> {
  const role = localStorage.getItem('crmef_user_role'); 
  
  const url = `${this.baseUrl}/admin/emploi/${seanceId}`; 

  return this.http.delete<any>(url, { headers: this.getHeaders() });
}
  // ============================================================
  // NOTES & STUDENT
  // ============================================================
  getNoteForClassAndModule(classeId: number, moduleId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/notes/${classeId}/${moduleId}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  uploadNote(classeId: number, moduleId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('classe_id', classeId.toString());
    formData.append('module_id', moduleId.toString());
    formData.append('fichier', file);
    return this.http.post<any>(`${this.baseUrl}/enseignant/notes`, formData, {
      headers: this.getFormHeaders()
    }).pipe(catchError(this.handleError));
  }

  deleteNote(classeId: number, moduleId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/enseignant/notes/${classeId}/${moduleId}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

 downloadNoteFile(classeId: number, moduleId: number): Observable<Blob> {
  return this.http.get(`${this.baseUrl}/notes/${classeId}/${moduleId}/download`, {
    headers: this.getHeaders(),
    responseType: 'blob' // <--- Indispensable pour récupérer un fichier PDF
  }).pipe(catchError(this.handleError));
}
  getStudentNotes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/etudiant/notes`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  getEtudiantProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/etudiant`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  changeEtudiantPassword(currentPassword: string, password: string, password_confirmation: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/etudiant/password`, {
      current_password: currentPassword,
      password,
      password_confirmation
    }, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * Récupère la liste des supports d'un module
   */
  getModuleSupports(moduleId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/modules/${moduleId}/supports`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * Télécharge un support binaire (PDF / Vidéo / Doc)
   */
  downloadSupportFile(moduleId: number, supportId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/modules/${moduleId}/supports/${supportId}/download`, {
      headers: this.getHeaders(),
      responseType: 'blob' // Obligatoire pour récupérer le binaire
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
  // COURSE SUPPORTS (SUPPORTS DE COURS)
  // ============================================================
  
  /**
   * Get all supports (course documents) for the authenticated teacher
   */
  getEnseignantSupports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/enseignant/supports`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * Get all supports for a specific module
   */
  getSupportsForModule(moduleId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/modules/${moduleId}/supports`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * Get a specific support (without binary data)
   */
  getSupport(moduleId: number, supportId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/modules/${moduleId}/supports/${supportId}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * Download a support file
   */
  downloadSupport(moduleId: number, supportId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/modules/${moduleId}/supports/${supportId}/download`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }

  /**
   * Create a new support (upload PDF file)
   */
  createSupport(moduleId: number, titre: string, description: string, fichier: File): Observable<any> {
    const formData = new FormData();
    formData.append('titre', titre);
    formData.append('description', description);
    formData.append('fichier', fichier);

    return this.http.post<any>(`${this.baseUrl}/modules/${moduleId}/supports`, formData, {
      headers: this.getFormHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * Update a support record (with optional file replacement)
   */
  updateSupport(moduleId: number, supportId: number, titre?: string, description?: string, fichier?: File): Observable<any> {
    const formData = new FormData();
    if (titre) formData.append('titre', titre);
    if (description) formData.append('description', description);
    if (fichier) formData.append('fichier', fichier);

    return this.http.put<any>(`${this.baseUrl}/modules/${moduleId}/supports/${supportId}`, formData, {
      headers: this.getFormHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * Delete a support
   */
  deleteSupport(moduleId: number, supportId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/modules/${moduleId}/supports/${supportId}`, {
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
  // CONTACT
  // ============================================================
  sendContact(data: { name: string; email: string; subject: string; message: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/contact`, data, {
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
    // Return the original error to preserve error.error.errors for validation errors
    return throwError(() => error);
  }
}
