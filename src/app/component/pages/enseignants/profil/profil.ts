import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-enseignant-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './profil.html',
  styleUrls: ['./profil.css']
})
export class ProfilComponent {
  
  // Simulation des données de l'enseignant
  profilInfo = {
    nom: 'Prof. Mohammed Alaoui',
    email: 'enseignant@crmef.ma',
    tel: '06 12 34 56 78',
    specialite: 'Didactique des Sciences (SVT)',
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

  sauvegarderProfil() {
    // Simulation d'une requête API de sauvegarde
    this.showProfileSuccess = true;
    setTimeout(() => {
      this.showProfileSuccess = false;
    }, 3000);
  }

  changerMotDePasse() {
    if(this.passwordData.new && this.passwordData.new === this.passwordData.confirm) {
      // Simulation d'une requête API
      this.showPwdSuccess = true;
      
      // Reset form
      this.passwordData = { current: '', new: '', confirm: '' };

      setTimeout(() => {
        this.showPwdSuccess = false;
      }, 3000);
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
