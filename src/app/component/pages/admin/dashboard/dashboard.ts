import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class AdminDashboardComponent {
  
  stats = {
    etudiants: 1250,
    profs: 85,
    classes: 42
  };

  recentActivities = [
    { type: 'user', message: 'Nouvel étudiant inscrit : Ahmed Yassine', time: 'Il y a 10 min' },
    { type: 'class', message: 'Classe SVT-4 créée par Admin', time: 'Il y a 1 heure' },
    { type: 'doc', message: 'Nouveau cours ajouté en Physique', time: 'Il y a 2 heures' },
    { type: 'user', message: 'Professeur Idrissi a mis à jour ses notes', time: 'Hier' }
  ];

}
