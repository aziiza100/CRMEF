import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Navbar } from '../navbar/navbar';


@Component({
  selector: 'app-header',
  imports: [Navbar, RouterOutlet, TranslateModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  currentLang: 'fr' | 'ar' = 'fr';

 constructor(private translate: TranslateService) {

  this.translate.setDefaultLang('fr');

  const savedLang = localStorage.getItem('lang');


  this.currentLang = savedLang === 'ar' ? 'ar' : 'fr';

  this.translate.use(this.currentLang);

  document.documentElement.dir =
    this.currentLang === 'ar' ? 'rtl' : 'ltr';
    
}

  changeLang(lang: 'fr' | 'ar') {
    console.log('CHANGE TO:', lang);
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('lang', lang);

    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
  
}
