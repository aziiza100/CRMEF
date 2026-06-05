import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(private router: Router, private translate: TranslateService) {}

  onSubmit() {
    this.errorMessage = '';
    
    if (!this.email || !this.password) {
      this.errorMessage = this.translate.instant('login.errorEmpty');
      return;
    }

    this.isLoading = true;

    // Simulate authentication delay
    setTimeout(() => {
      this.isLoading = false;
      
      // Allow specific demo user for UI flow
      if (this.email === 'admin@admin.com') {
        this.router.navigate(['/espace-admin']);
      } else if (this.email === 'etudient@gmail.com') {
        this.router.navigate(['/espace-etudiant']);
      } else if (this.email === 'enseignant@crmef.ma' || this.email.includes('@crmef.ma')) {
        this.router.navigate(['/espace-enseignant']);
      } else {
        // Just log them in anyway to show the UI
        this.router.navigate(['/espace-enseignant']);
      }
    }, 1200);
  }
}
