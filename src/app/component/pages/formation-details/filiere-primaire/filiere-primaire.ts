import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-filiere-primaire',
  imports: [CommonModule, RouterModule, TranslateModule],
  standalone: true,
  templateUrl: './filiere-primaire.html',
  styleUrl: './filiere-primaire.css',
})
export class FilierePrimaireComponent {
  translate = inject(TranslateService);
  
  // Définit le semestre 1 comme actif par défaut
  activeTab: string = 's1'; 

  // Méthode pour changer d'onglet
  switchTab(tabId: string) {
    this.activeTab = tabId;
  }
}