import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { Navbar } from './component/shared/navbar/navbar';
import { Layout } from './component/shared/layout/layout';
import { AuthGuard } from './core/services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./component/pages/home/home').then(m => m.Home)
      },
      {
        path: 'presentation', 
        loadComponent: () =>
          import('./component/pages/presentation/presentation').then(m => m.Presentation)
      },
      {
        path: 'presentation/Historique',
        loadComponent: () =>
          import('./component/pages/presentation/composants/historique/historique').then(m => m.Historique)
      },
      {
        path: 'presentation/Missions-objectifs',
        loadComponent: () =>
          import('./component/pages/presentation/composants/missions-objectifs/missions-objectifs').then(m => m.MissionsObjectifs)
      },
      {
        path: 'presentation/Organigramme',
        loadComponent: () =>
          import('./component/pages/presentation/composants/organigramme/organigramme').then(m => m.Organigramme)
      },
      {
        path: 'presentation/Partenaires',
        loadComponent: () =>
          import('./component/pages/presentation/composants/partenaires/partenaires').then(m => m.Partenaires)
      },
      {
        path: 'formations',
        loadComponent: () =>
          import('./component/pages/formation/formation').then(m => m.Formation)
      },
      {
        path: 'formations/primaire',
        loadComponent: () =>
          import('./component/pages/formation-details/filiere-primaire/filiere-primaire').then(m => m.FilierePrimaireComponent)
      },
      {
        path: 'formations/secondaire',
        loadComponent: () =>
          import('./component/pages/formation-details/filiere-secondaire/filiere-secondaire').then(m => m.FiliereSecondaireComponent)
      },
      {
        path: 'formations/qualifiante',
        loadComponent: () =>
          import('./component/pages/formation-details/filiere-qualifiante/filiere-qualifiante').then(m => m.FiliereQualifianteComponent)
      },
      {
        path: 'formations/DescriptionProgrammes',
        loadComponent: () =>
          import('./component/pages/formation/composants/description-programmes/description-programmes').then(m => m.DescriptionProgrammes)
      },
      {
        path: 'formations/Modules-contenus',
        loadComponent: () =>
          import('./component/pages/formation/composants/modules-contenus/modules-contenus').then(m => m.ModulesContenus)
      },
      {
        path: 'formations/Conditions-Accès',
        loadComponent: () =>
          import('./component/pages/formation/composants/conditions-acces/conditions-acces').then(m => m.ConditionsAcces)
      },
      {
        path: 'actualites',
        loadComponent: () =>
          import('./component/pages/actualites/actualites').then(m => m.ActualitesComponent)
      },
      {
        path: 'actualites/:id',
        loadComponent: () =>
          import('./component/pages/actualites-details/actualites-details').then(m => m.ActualitesDetailsComponent)
      },
      {
        path: 'home/banniere-dynamique',
        loadComponent: () =>
          import('./component/pages/home/composants/banniere-dynamique/banniere-dynamique').then(m => m.BanniereDynamique)
      },
      {
        path: 'home/message-directeur',
        loadComponent: () =>
          import('./component/pages/home/composants/message-directeur/message-directeur').then(m => m.MessageDirecteur)
      },
      {
        path: 'home/presentation-crmef',
        loadComponent: () =>
          import('./component/pages/home/composants/presentation-crmef/presentation-crmef').then(m => m.PresentationCRMEF)
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./component/pages/contact/contact').then(m => m.Contact)
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./component/pages/login/login').then(m => m.Login)
      },
      {
        path: 'espace-pedagogique',
        loadComponent: () =>
          import('./component/pages/pedagogique/pedagogique').then(m => m.Pedagogique)
      }
    ]
  },
  {
    path: 'espace-enseignant',
    loadComponent: () => import('./component/pages/enseignants/enseignants').then(m => m.Enseignants),
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: { roles: ['enseignant', 'teacher'] },
    children: [
      {
        path: '',
        loadComponent: () => import('./component/pages/enseignants/dashboard/dashboard').then(m => m.EnseignantDashboard)
      },
      {
        path: 'emploi',
        loadComponent: () => import('./component/pages/enseignants/emploi/emploi').then(m => m.EnseignantEmploiComponent)
      },
      {
        path: 'cours',
        loadComponent: () => import('./component/pages/enseignants/cours/cours').then(m => m.CoursComponent)
      },
      {
        path: 'telecharger-cours',
        loadComponent: () => import('./component/pages/enseignants/telecharger-cours/telecharger-cours').then(m => m.TelechargerCoursComponent)
      },
      {
        path: 'classes',
        loadComponent: () => import('./component/pages/enseignants/classes/classes').then(m => m.ClassesComponent)
      },
      {
        path: 'notes',
        loadComponent: () => import('./component/pages/enseignants/notes/notes').then(m => m.NotesComponent)
      },
      {
        path: 'profil',
        loadComponent: () => import('./component/pages/enseignants/profil/profil').then(m => m.ProfilComponent)
      }
    ]
  },
  {
    path: 'espace-etudiant',
    loadComponent: () => import('./component/pages/etudiants/etudiants').then(m => m.EtudiantsComponent),
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: { roles: ['etudiant'] },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./component/pages/etudiants/dashboard/dashboard').then(m => m.EtudiantDashboardComponent)
      },
      {
        path: 'elearning',
        loadComponent: () => import('./component/pages/etudiants/elearning/elearning').then(m => m.ElearningComponent)
      },
      {
        path: 'resultats',
        loadComponent: () => import('./component/pages/etudiants/resultats/resultats').then(m => m.EtudiantResultatsComponent)
      },
      {
        path: 'emploi',
        loadComponent: () => import('./component/pages/etudiants/emploi/emploi').then(m => m.EtudiantEmploiComponent)
      },
      {
        path: 'profil',
        loadComponent: () => import('./component/pages/etudiants/profil/profil').then(m => m.EtudiantProfilComponent)
      }
    ]
  },
  {
    path: 'espace-admin',
    loadComponent: () => import('./component/pages/admin/admin').then(m => m.AdminComponent),
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: { roles: ['admin'] },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./component/pages/admin/dashboard/dashboard').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./component/pages/admin/users/users').then(m => m.AdminUsersComponent)
      },
      {
        path: 'classes',
        loadComponent: () => import('./component/pages/admin/classes/classes').then(m => m.AdminClassesComponent)
      },
      {
        path: 'filieres',
        loadComponent: () => import('./component/pages/admin/filieres/filieres').then(m => m.AdminFilieresComponent)
      },
      {
        path: 'formations',
        loadComponent: () => import('./component/pages/admin/formations/formations').then(m => m.AdminFormationsComponent)
      },
      {
        path: 'modules',
        loadComponent: () => import('./component/pages/admin/modules/modules').then(m => m.AdminModulesComponent)
      },
      {
        path: 'content',
        loadComponent: () => import('./component/pages/admin/content/content').then(m => m.AdminContentComponent)
      },
      {
        path: 'emploi',
        loadComponent: () => import('./component/pages/admin/emploi/emploi').then(m => m.AdminEmploiComponent)
      },
      {
        path: 'messages',
        loadComponent: () => import('./component/pages/admin/messages/messages').then(m => m.AdminMessagesComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./component/pages/admin/settings/settings').then(m => m.AdminSettingsComponent)
      }
    ]
  }
];