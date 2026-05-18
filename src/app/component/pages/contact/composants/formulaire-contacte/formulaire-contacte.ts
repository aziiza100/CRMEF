import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-formulaire-contacte',
  imports: [FormsModule, TranslateModule],
  templateUrl: './formulaire-contacte.html',
  styleUrl: './formulaire-contacte.css',
})
export class FormulaireContacte {
  form = { name: '', email: '', subject: '', message: '' };
  loading = false;
  sent = false;
  error = '';

  constructor(private translate: TranslateService) {}

  onSubmit(contactForm: NgForm): void {
    if (contactForm.invalid || this.loading) {
      return;
    }

    this.loading = true;
    this.sent = false;
    this.error = '';

    setTimeout(() => {
      this.loading = false;
      this.sent = true;
      this.form = { name: '', email: '', subject: '', message: '' };
      contactForm.resetForm();
    }, 800);
  }
}
