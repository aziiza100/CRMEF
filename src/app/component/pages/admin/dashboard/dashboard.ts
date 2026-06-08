import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { ApiService, DashboardStats } from '../../../../core/services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class AdminDashboardComponent {
  
  isLoading = true;
  error = '';

  stats = {
    etudiants: 0,
    profs: 0,
    classes: 0,
    filieres: 0
  };

  recentActivities: { type: string, message: string, time: string }[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getDashboardStats().subscribe({
      next: (data: DashboardStats) => {
        this.stats = data.stats;
        this.recentActivities = data.recentActivities;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des statistiques.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }
}
