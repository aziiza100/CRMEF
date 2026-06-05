import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class AdminSettingsComponent {
  
  activeTab: 'general' | 'system' = 'general';
  
  toastMessage = '';
  showToast = false;

  settings = {
    schoolName: 'CRMEF Oujda',
    email: 'contact@crmef.ma',
    phone: '+212 5 36 68 00 00',
    address: 'Boulevard Mohammed VI, Oujda, Maroc',
    academicYear: '2023/2024',
    maintenance: false,
    registrations: true
  };

  switchTab(tab: 'general' | 'system') {
    this.activeTab = tab;
  }

  saveSettings() {
    this.triggerToast('Paramètres sauvegardés avec succès !');
  }

  triggerToast(msg: string) {
    this.toastMessage = msg;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
