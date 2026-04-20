import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Communication } from './composants/communication/communication';
import { GestionClasses } from './composants/gestion-classes/gestion-classes';
import { Notes } from './composants/notes/notes';
import { Supports } from './composants/supports/supports';

@Component({
  selector: 'app-enseignants',
  imports: [RouterLink ,Communication , GestionClasses , Notes , Supports],
  standalone: true,
  templateUrl: './enseignants.html',
  styleUrl: './enseignants.css',
})
export class Enseignants {}
 