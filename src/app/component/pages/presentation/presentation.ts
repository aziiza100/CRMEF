import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Historique } from './composants/historique/historique';
import { MissionsObjectifs } from './composants/missions-objectifs/missions-objectifs';
import { Organigramme } from './composants/organigramme/organigramme';
import { Partenaires } from './composants/partenaires/partenaires';
import AOS from 'aos';

@Component({
  selector: 'app-presentation',
  imports: [RouterLink, TranslateModule, Historique, MissionsObjectifs, Organigramme, Partenaires],
  standalone: true,
  templateUrl: './presentation.html',
  styleUrl: './presentation.css',
})
export class Presentation {
  ngOnInit(): void {
    AOS.init({ once: true });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      AOS.refresh();
    }, 100);
  }
}
