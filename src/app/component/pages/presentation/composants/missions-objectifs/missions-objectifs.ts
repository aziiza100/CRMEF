import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-missions-objectifs',
  imports: [TranslateModule],
  templateUrl: './missions-objectifs.html',
  styleUrl: './missions-objectifs.css',
})
export class MissionsObjectifs {
  constructor(public translate: TranslateService){}
}
