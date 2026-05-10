import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-partenaires',
  imports: [TranslateModule],
  templateUrl: './partenaires.html',
  styleUrl: './partenaires.css',
})
export class Partenaires {
  constructor(public translate: TranslateService){}
}
