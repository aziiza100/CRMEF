import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Historique } from './composants/historique/historique';
import { MissionsObjectifs } from './composants/missions-objectifs/missions-objectifs';
import { Organigramme } from './composants/organigramme/organigramme';
import { Partenaires } from './composants/partenaires/partenaires';

@Component({
  selector: 'app-presentation',
  imports: [RouterLink, TranslateModule, Historique, MissionsObjectifs, Organigramme, Partenaires],
  standalone: true,
  templateUrl: './presentation.html',
  styleUrl: './presentation.css',
})
export class Presentation {}
