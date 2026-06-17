import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  constructor(private translate: TranslateService) {}

  /**
   * Shows a toast notification.
   */
  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 4000) {
    const id = Date.now() + Math.random();
    
    // Try to translate the message. If it matches a key, it translates; otherwise, it returns the string itself.
    let translatedMsg = message;
    try {
      translatedMsg = this.translate.instant(message);
    } catch (e) {
      // ignore
    }

    this.toasts.update(current => [...current, { id, type, message: translatedMsg, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        this.close(id);
      }, duration);
    }
  }

  success(message: string, duration?: number) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration?: number) {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number) {
    this.show(message, 'info', duration);
  }

  close(id: number) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  /**
   * Helper to parse and extract a user-friendly error message from server response errors.
   */
  getErrorMessage(error: any, defaultMsg = 'Une erreur est survenue'): string {
    if (!error) return defaultMsg;

    if (typeof error === 'string') return error;

    // Check for Laravel validation errors
    if (error.error?.errors && typeof error.error.errors === 'object') {
      const fieldErrors = Object.values(error.error.errors);
      if (fieldErrors.length > 0 && Array.isArray(fieldErrors[0]) && fieldErrors[0].length > 0) {
        return fieldErrors[0][0]; // Return the first validation message
      }
    }

    // Check for custom backend exception message
    if (error.error?.message) {
      return error.error.message;
    }

    // Check for standard HTTP status code messages
    if (error.message) {
      if (error.message.includes('Http failure response')) {
        if (error.status === 0) {
          return 'Impossible de contacter le serveur. Veuillez vérifier votre connexion ou si le backend est actif.';
        }
        if (error.status === 401) {
          return 'Votre session a expiré. Veuillez vous reconnecter.';
        }
        if (error.status === 403) {
          return "Vous n'avez pas l'autorisation nécessaire pour effectuer cette action.";
        }
        if (error.status === 404) {
          return 'La ressource demandée est introuvable.';
        }
        if (error.status === 422) {
          return 'Les données fournies sont incorrectes ou incomplètes.';
        }
        if (error.status === 500) {
          return 'Erreur interne du serveur. Veuillez réessayer plus tard.';
        }
      }
      return error.message;
    }

    return defaultMsg;
  }
}
