import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export class CustomLoader implements TranslateLoader {

  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
  console.log('LOADER CALLED:', lang);
    return this.http.get(`./i18n/${lang}.json`);
  }
}
