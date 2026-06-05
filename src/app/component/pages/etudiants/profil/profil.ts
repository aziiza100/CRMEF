import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-etudiant-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './profil.html',
  styleUrls: ['./profil.css']
})
export class EtudiantProfilComponent {
  
  // Données de l'étudiant (Mock)
  etudiant = {
    nom: 'Etudiant Test',
    cne: 'G123456789',
    email: 'etudient@gmail.com',
    classe: '1ère Année Qualifiant (SVT)',
    avatar: 'https://ui-avatars.com/api/?name=Etudiant+Test&background=8b5cf6&color=fff&size=128'
  };

  // Formulaire de mot de passe
  oldPwd = '';
  newPwd = '';
  confirmPwd = '';
  
  showSuccess = false;
  showError = false;

  updatePassword() {
    this.showError = false;
    this.showSuccess = false;

    if (this.newPwd !== this.confirmPwd || !this.newPwd) {
      this.showError = true;
      return;
    }

    // Simulation appel API
    console.log('Mot de passe mis à jour !');
    this.showSuccess = true;
    
    // Reset form
    this.oldPwd = '';
    this.newPwd = '';
    this.confirmPwd = '';

    setTimeout(() => {
      this.showSuccess = false;
    }, 4000);
  }
}
