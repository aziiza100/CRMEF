import { RouterLink } from '@angular/router';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AdresseCarte } from './composants/adresse-carte/adresse-carte';
import { FormulaireContacte } from './composants/formulaire-contacte/formulaire-contacte';
import { InformationContact } from './composants/information-contact/information-contact';
import AOS from 'aos';

@Component({
  selector: 'app-contact',
  imports: [RouterLink, TranslateModule, AdresseCarte, FormulaireContacte, InformationContact],
  standalone: true,
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  ngOnInit(): void {
    AOS.init({ once: true });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      AOS.refresh();
    }, 100);
  }
}
