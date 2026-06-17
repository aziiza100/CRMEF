import { importProvidersFrom } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

export default [
  importProvidersFrom(TranslateModule.forRoot()),
  importProvidersFrom(RouterModule.forRoot([]))
];
