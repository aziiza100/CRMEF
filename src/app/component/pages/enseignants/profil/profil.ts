import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-enseignant-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './profil.html',
  styleUrls: ['./profil.css']
})
export class ProfilComponent implements OnInit {
  
  constructor(private api: ApiService) {}

  // Profil de l'enseignant
  profilInfo = {
    nom: 'Prof. Mohammed Alaoui',
    email: 'enseignant@crmef.ma',
    tel: '06 12 34 56 78',
    specialite: 'Didactique des Sciences (SVT)',
    grade: 'Professeur Agrégé',
    bio: 'Professeur agrégé avec plus de 15 ans d\'expérience dans l\'enseignement secondaire et la formation des formateurs.',
    dateRejoindre: 'Septembre 2020',
    avatar: 'https://ui-avatars.com/api/?name=Mohammed+Alaoui&background=005E76&color=fff&size=150'
  };

  // Variables pour le changement de mot de passe
  passwordData = {
    current: '',
    new: '',
    confirm: ''
  };

  // États pour les notifications (Toast)
  showProfileSuccess = false;
  showPwdSuccess = false;
  showPwdError = false;
  pwdErrorMsg = '';

  ngOnInit() {
    this.loadProfil();
  }

  loadProfil() {
    this.api.getEnseignantProfile().subscribe({
      next: (profile) => {
        this.profilInfo.nom = profile.prenom && profile.nom ? `${profile.prenom} ${profile.nom}` : profile.nom ?? this.profilInfo.nom;
        this.profilInfo.email = profile.email || this.profilInfo.email;
        this.profilInfo.tel = profile.tele || this.profilInfo.tel;
        this.profilInfo.specialite = profile.specialite || this.profilInfo.specialite;
        this.profilInfo.bio = profile.bio || this.profilInfo.bio;
        this.profilInfo.dateRejoindre = profile.created_at || this.profilInfo.dateRejoindre;
        this.profilInfo.avatar = profile.image_base64 || this.profilInfo.avatar;
      },
      error: () => {
        // Keep default values if profile load fails.
      }
    });
  }

  sauvegarderProfil() {
    const payload: any = {
      nom: this.profilInfo.nom,
      tele: this.profilInfo.tel,
      specialite: this.profilInfo.specialite,
      grade: this.profilInfo.grade,
    };

    if (this.profilInfo.avatar && this.profilInfo.avatar.startsWith('data:image/')) {
      payload.image = this.profilInfo.avatar;
    }

    this.api.updateEnseignantProfile(payload).subscribe({
      next: () => {
        this.showProfileSuccess = true;
        setTimeout(() => {
          this.showProfileSuccess = false;
        }, 3000);
      },
      error: () => {
        // garder la notification silencieuse, backend gère l'erreur
      }
    });
  }

  changerMotDePasse() {
    if (this.passwordData.new && this.passwordData.new === this.passwordData.confirm) {
      this.api.updateEnseignantPassword(this.passwordData.current, this.passwordData.new, this.passwordData.confirm)
        .subscribe({
          next: () => {
            this.showPwdSuccess = true;
            this.showPwdError = false;
            this.passwordData = { current: '', new: '', confirm: '' };
            setTimeout(() => {
              this.showPwdSuccess = false;
            }, 3000);
          },
          error: (error: any) => {
            this.showPwdError = true;
            // Handle detailed validation errors
            if (error.error?.errors) {
              const errors = error.error.errors;
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
              
              this.pwdErrorMsg = errorMessages.length > 0 ? errorMessages.join(' • ') : error.error?.message || 'Une erreur est survenue';
            } else {
              this.pwdErrorMsg = error.error?.message || 'Une erreur est survenue lors de la modification du mot de passe.';
            }
            setTimeout(() => {
              this.showPwdError = false;
            }, 4000);
          }
        });
    }
  }

  onAvatarChange(event: any) {
    // Simulation d'un upload d'avatar
    if(event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilInfo.avatar = e.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }
}
