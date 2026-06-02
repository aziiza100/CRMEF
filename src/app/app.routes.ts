import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { Navbar } from './component/shared/navbar/navbar';
import { Layout } from './component/shared/layout/layout';
// import {Home} from './component/home/home'

export const routes: Routes = [
    // { path: 'home', component: Home }
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
  }]}
  ,
  {
    path: 'espace-pedagogique',
    loadComponent: () =>
      import('./component/pages/pedagogique/pedagogique').then(m => m.Pedagogique)
  },
  {
    path: 'espace-enseignant',
    loadComponent: () =>
      import('./component/pages/enseignants/enseignants').then(m => m.Enseignants)
  }, 
  {
    path: 'espace-etudiant',
    loadComponent: () =>
      import('./component/pages/etudiants/etudiants').then(m => m.Etudiants)
  }
];
  