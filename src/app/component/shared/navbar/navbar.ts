import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';

import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, RouterLink,TranslateModule],
  templateUrl: './navbar.html',
    styleUrls: ['./navbar.css'],
})
export class Navbar {
  @Input() isMenuOpen = false;
  @Output() closeMenuEvent = new EventEmitter<void>();
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
  
  closeMenu() {
    this.closeMenuEvent.emit();
  }
}
