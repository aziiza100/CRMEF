import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-filiere-secondaire',
  imports: [CommonModule, RouterModule, TranslateModule],
  standalone: true,
  templateUrl: './filiere-secondaire.html',
  styleUrl: './filiere-secondaire.css',
})
export class FiliereSecondaireComponent {
  translate = inject(TranslateService);
  activeTab: string = 's1'; 

  switchTab(tabId: string) {
    this.activeTab = tabId;
  }
}