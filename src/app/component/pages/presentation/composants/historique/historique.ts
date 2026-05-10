import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-historique',
  imports: [TranslateModule],
  templateUrl: './historique.html',
  styleUrl: './historique.css',
})
export class Historique {
  constructor(public translate: TranslateService){}
}
