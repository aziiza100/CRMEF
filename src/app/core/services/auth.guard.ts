import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { ApiService } from './api.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router, private api: ApiService) {}

  private checkAuthWithRole(route?: ActivatedRouteSnapshot): any {
    const token = localStorage.getItem('crmef_admin_token');
    if (!token) {
      return of(this.router.parseUrl('/login'));
    }

    // Toujours faire un appel au serveur pour vérifier le rôle actuel
    return this.api.getMe().pipe(
      map((response: any) => {
        // Extraire le user de la réponse API
        const userData = response?.user || response;
        const role = userData?.role ?? 'enseignant';
        this.api.setUserRole(role);

        const requiredRoles = route?.data?.['roles'] || route?.parent?.data?.['roles'];
        
        // Si la route a des rôles requis
        if (requiredRoles && Array.isArray(requiredRoles)) {
          // Si le rôle n'est pas autorisé
          if (!requiredRoles.includes(role)) {
            // Rediriger vers l'espace du rôle de l'utilisateur
            return this.getRedirectUrlForRole(role);
          }
        }
        
        return true;
      }),
      catchError(() => of(this.router.parseUrl('/login')))
    );
  }

  /**
   * Retourne l'URL d'espace selon le rôle
   */
  private getRedirectUrlForRole(role: string): UrlTree {
    if (role === 'admin') {
      return this.router.parseUrl('/espace-admin');
    }
    if (role === 'etudiant') {
      return this.router.parseUrl('/espace-etudiant');
    }
    if (role === 'enseignant' || role === 'teacher') {
      return this.router.parseUrl('/espace-enseignant');
    }
    return this.router.parseUrl('/login');
  }

  canActivate(route: ActivatedRouteSnapshot): any {
    return this.checkAuthWithRole(route);
  }

  canActivateChild(route: ActivatedRouteSnapshot): any {
    return this.checkAuthWithRole(route);
  }
}
