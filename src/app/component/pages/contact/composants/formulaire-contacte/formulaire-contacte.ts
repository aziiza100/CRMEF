import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../../../../core/services/api.service';

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

  constructor(
    private translate: TranslateService,
    private apiService: ApiService
  ) {}

  onSubmit(contactForm: NgForm): void {
    if (contactForm.invalid || this.loading) {
      return;
    }

    this.loading = true;
    this.sent = false;
    this.error = '';

    this.apiService.sendContact(this.form).subscribe({
      next: (response) => {
        this.loading = false;
        this.sent = true;
        this.form = { name: '', email: '', subject: '', message: '' };
        contactForm.resetForm();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || "Une erreur s'est produite lors de l'envoi. Veuillez réessayer plus tard.";
      }
    });
  }
}
