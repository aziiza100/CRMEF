import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * Custom translation loader that tries to fetch translations from the Laravel API.
 * Falls back to local JSON files if API is unavailable.
 */
@Injectable()
export class CustomLoader implements TranslateLoader {
  private readonly apiUrl = `${environment.apiUrl}/translations`;
  private readonly localPath = '/i18n';

  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    // Try API first, fall back to local files
    return this.http.get(`${this.apiUrl}/${lang}`).pipe(
      map((response: any) => {
        // API returns { success: true, data: { translations: {...} } }
        if (response?.data?.translations) {
          return response.data.translations;
        }
        if (response?.data) {
          return response.data;
        }
        return response;
      }),
      catchError(() => {
        // Fall back to local i18n JSON files
        console.log(`[TranslateLoader] API unavailable, loading local ${lang}.json`);
        return this.http.get(`${this.localPath}/${lang}.json`).pipe(
          catchError(() => {
            console.error(`[TranslateLoader] Could not load ${lang}.json`);
            return of({});
          })
        );
      })
    );
  }
}
