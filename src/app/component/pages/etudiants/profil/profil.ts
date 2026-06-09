import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-etudiant-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './profil.html',
  styleUrls: ['./profil.css']
})
export class EtudiantProfilComponent implements OnInit {
  etudiant = {
    nom: 'Etudiant Test',
    cne: 'G123456789',
    email: 'etudient@gmail.com',
    classe: '1ère Année Qualifiant (SVT)',
    avatar: 'https://ui-avatars.com/api/?name=Etudiant+Test&background=8b5cf6&color=fff&size=128'
  };

  oldPwd = '';
  newPwd = '';
  confirmPwd = '';
  showSuccess = false;
  showError = false;
  errorMessage = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadProfil();
  }

  loadProfil(): void {
    this.api.getEtudiantProfile().subscribe({
      next: (profile) => {
        const fullName = profile.prenom && profile.nom ? `${profile.prenom} ${profile.nom}` : profile.nom ?? profile.prenom ?? 'Étudiant';
        this.etudiant = {
          nom: fullName,
          cne: profile.cne ?? '-',
          email: profile.email ?? '-',
          classe: profile.classe ? `${profile.classe.nom}${profile.classe.filiere ? ' — ' + profile.classe.filiere : ''}` : 'Non affecté',
          avatar: profile.image_base64 || this.buildAvatarUrl(fullName)
        };
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err?.error?.message || 'Impossible de charger votre profil.';
      }
    });
  }

  buildAvatarUrl(name: string): string {
    const encodedName = encodeURIComponent(name.trim());
    return `https://ui-avatars.com/api/?name=${encodedName}&background=8b5cf6&color=fff&size=128`;
  }

  updatePassword(): void {
    this.showError = false;
    this.showSuccess = false;
    this.errorMessage = '';

    if (!this.oldPwd || !this.newPwd || !this.confirmPwd) {
      this.showError = true;
      this.errorMessage = 'Veuillez remplir tous les champs du mot de passe.';
      return;
    }

    if (this.newPwd !== this.confirmPwd) {
      this.showError = true;
      this.errorMessage = 'Les nouveaux mots de passe ne correspondent pas.';
      return;
    }

    this.api.changeEtudiantPassword(this.oldPwd, this.newPwd, this.confirmPwd).subscribe({
      next: () => {
        this.showSuccess = true;
        this.oldPwd = '';
        this.newPwd = '';
        this.confirmPwd = '';
        setTimeout(() => {
          this.showSuccess = false;
        }, 4000);
      },
      error: (err) => {
        this.showError = true;
        
        // Handle detailed validation errors
        if (err?.error?.errors) {
          const errors = err.error.errors;
          const errorMessages: string[] = [];
          
          if (errors.current_password) {
            errorMessages.push('Mot de passe actuel requis');
          }
          if (errors.password) {
            if (errors.password[0]?.includes('min')) {
              errorMessages.push('Le nouveau mot de passe doit contenir au moins 8 caractères');
            } else if (errors.password[0]?.includes('confirmed')) {
              errorMessages.push('Les mots de passe ne correspondent pas');
            } else {
              errorMessages.push(errors.password[0]);
            }
          }
          
          this.errorMessage = errorMessages.length > 0 ? errorMessages.join(' • ') : err?.error?.message || 'Une erreur est survenue';
        } else {
          this.errorMessage = err?.error?.message || 'Impossible de mettre à jour le mot de passe.';
        }
      }
    });
  }
}
