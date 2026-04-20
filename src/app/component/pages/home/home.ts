import { Component } from '@angular/core';
// import { RouterLink } from '@angular/router';
import { Actualites } from './composants/actualites/actualites';
import { BanniereDynamique } from './composants/banniere-dynamique/banniere-dynamique';
import { MessageDirecteur } from './composants/message-directeur/message-directeur';
import { PresentationCRMEF } from './composants/presentation-crmef/presentation-crmef';

@Component({
  selector: 'app-home',
  imports: [Actualites,BanniereDynamique,MessageDirecteur,PresentationCRMEF],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
