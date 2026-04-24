import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-layout',
  imports: [RouterLink, Navbar , RouterOutlet, TranslateModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  currentLang: 'fr' | 'ar' = 'fr';

 constructor(private translate: TranslateService) {

  this.translate.setDefaultLang('fr');

  const savedLang = localStorage.getItem('lang');

  // ⚠️ validation مهم
  this.currentLang = savedLang === 'ar' ? 'ar' : 'fr';

  this.translate.use(this.currentLang);

  document.documentElement.dir =
    this.currentLang === 'ar' ? 'rtl' : 'ltr';
    console.log(this.translate.currentLang);
    
}

  changeLang(lang: 'fr' | 'ar') {
    console.log('CHANGE TO:', lang);
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('lang', lang);

    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
  
}
