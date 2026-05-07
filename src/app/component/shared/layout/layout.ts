import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Header } from '../header/header';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, TranslateModule , Header, Navbar],
  templateUrl: './layout.html', 
  styleUrl: './layout.css',
})
export class Layout {
  currentLang: 'fr' | 'ar' = 'fr';

 constructor(private translate: TranslateService) {

  this.translate.setDefaultLang('fr');

  const savedLang = localStorage.getItem('lang');


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
