import { MessageDirecteur } from './../home/composants/message-directeur/message-directeur';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Emploi } from './composants/emploi/emploi';
import { MessagerieInterne } from './composants/messagerie-interne/messagerie-interne';
import { Profil } from './composants/profil/profil';
import { Resultats } from './composants/resultats/resultats';

@Component({
  selector: 'app-etudiants',
  imports: [RouterLink, Emploi, MessagerieInterne, Profil,Resultats],
  standalone: true,
  templateUrl: './etudiants.html', 
  styleUrl: './etudiants.css',
})
export class Etudiants {}
 