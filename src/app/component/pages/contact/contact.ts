import { RouterLink } from '@angular/router';
import { Component } from '@angular/core';
import { AdresseCarte } from './composants/adresse-carte/adresse-carte';
import { FormulaireContacte } from './composants/formulaire-contacte/formulaire-contacte';
import { InformationContact } from './composants/information-contact/information-contact';

@Component({ 
  selector: 'app-contact',
  imports: [RouterLink, AdresseCarte, FormulaireContacte, InformationContact],
  standalone: true,
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {}
 