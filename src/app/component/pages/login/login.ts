import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  mode: 'login' | 'forgot' | 'reset' = 'login';
  resetToken = '';
  resetPasswordValue = '';
  resetPasswordConfirm = '';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe(params => {
      const token = params.get('token');
      if (token) {
        this.mode = 'reset';
        this.resetToken = token;
        this.email = params.get('email') || '';
      }
    });
  }

  onSubmit() {
    if (this.mode === 'login') {
      this.login();
    } else if (this.mode === 'forgot') {
      this.sendForgotPassword();
    } else if (this.mode === 'reset') {
      this.resetPassword();
    }
  }

  login() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = this.translate.instant('login.errorEmpty');
      return;
    }

    this.isLoading = true;

    this.api.login(this.email, this.password).subscribe({
      next: (res) => {
        this.isLoading = false;
        const role = res.user?.role ?? 'enseignant';
        this.api.setUserRole(role);
        if (role === 'admin') {
          this.router.navigate(['/espace-admin']);
        } else if (role === 'etudiant') {
          this.router.navigate(['/espace-etudiant']);
        } else {
          this.router.navigate(['/espace-enseignant']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.message || 'Erreur de connexion';
      }
    });
  }

  sendForgotPassword() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email) {
      this.errorMessage = this.translate.instant('login.errorEmail');
      return;
    }

    this.isLoading = true;

    this.api.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = res.message || 'Un lien de réinitialisation a été envoyé à votre email.';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.message || 'Impossible d’envoyer le lien de réinitialisation.';
      }
    });
  }

  resetPassword() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email || !this.resetToken || !this.resetPasswordValue || !this.resetPasswordConfirm) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.resetPasswordValue !== this.resetPasswordConfirm) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isLoading = true;

    this.api.resetPassword(this.email, this.resetToken, this.resetPasswordValue, this.resetPasswordConfirm).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = res.message || 'Mot de passe réinitialisé avec succès.';
        this.mode = 'login';
        this.password = '';
        this.resetPasswordValue = '';
        this.resetPasswordConfirm = '';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.message || 'Impossible de réinitialiser le mot de passe.';
      }
    });
  }

  switchToForgot() {
    this.mode = 'forgot';
    this.errorMessage = '';
    this.successMessage = '';
    this.password = '';
    this.resetPasswordValue = '';
    this.resetPasswordConfirm = '';
  }

  backToLogin() {
    this.mode = 'login';
    this.errorMessage = '';
    this.successMessage = '';
    this.resetToken = '';
    this.resetPasswordValue = '';
    this.resetPasswordConfirm = '';
  }
}
