import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../../../core/services/api.service';

interface CoursDoc {
  
  id: number,
  titre: string,
  description: string,
  date: string,
  fichier: string,
  format: 'pdf',
  enseignant: string
  nom_fichier: string;
  module_id: number;
  created_at:Date
}

@Component({
  selector: 'app-enseignant-telecharger-cours',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, HttpClientModule],
  templateUrl: './telecharger-cours.html',
  styleUrls: ['./telecharger-cours.css']
})
export class TelechargerCoursComponent implements OnInit {
  errorMessage = '';
toggleClasse(_t20: any) {
throw new Error('Method not implemented.');
}
  private apiService: ApiService = inject(ApiService);
  
  searchTerm: string = '';
  showSuccess = false; 
  classesData: any[] = [];
  availableClasses: any;
  isLoading = true;
  coursPublies: CoursDoc[] = [];
  coursFiltres: CoursDoc[] = [];


  selectedSpecialty: string = '';
  //filter
   recherche = '';
  filtreStatut = 'Tous';

 ngOnInit() {
    this.chargerClassesEnseignant();
    this.chargerSupportsEnseignant();
  } 
  
   chargerClassesEnseignant() {
    this.apiService.getEnseignantProfile().subscribe({
      next: (profile: any) => {
        const classes = profile.classes ?? profile.enseignant?.classes ?? [];
        if (classes && classes.length > 0) {
          this.classesData = classes;
          this.availableClasses = classes.map((classe: any) =>
            ({ id: classe.id, nom: classe.nom || 'Classe inconnue' })
          );
         
        } else {
          this.availableClasses = [];
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des classes', err);
        this.availableClasses = [];
        this.isLoading = false;
      }
    });
  }

   chargerSupportsEnseignant() {
    this.apiService.getEnseignantSupports().subscribe({
      next: (supports: any[]) => {
        this.coursPublies = supports.map((support: any) => ({
          id: support.id,
          titre: support.titre,
          description: support.description || '',
          date: support.created_at ? new Date(support.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          fichier: support.nom_fichier || support.nom_fichier,
          format: support.nom_fichier ? support.nom_fichier.split('.').pop() : 'pdf',
          enseignant: support.enseignant || 'Enseignant',
          nom_fichier :support.nom_fichier,
          module_id: support.id_module,
          created_at: support.created_at ? new Date(support.created_at) : new Date()
        }));
        // this.appliquerFiltres();
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des supports', err);
        this.coursPublies = [];
      }
    });
  }


downloadSupport(support: any) {
  // 1. Vérification sécurisée de la présence du fichier
  if (!support || !support.fichier) {
    console.error('Support invalide ou fichier manquant', support);
    return;
  }

  // 2. Récupération sécurisée des variables (avec valeur par défaut si module_id est undefined)
  const moduleId = support.module_id || 0; 
  const supportId = support.id;
  const nomFichier = support.nom_fichier || `${support.titre}.pdf`;

  // 3. Appel à votre API
  this.apiService.downloadSupport(moduleId, supportId).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nomFichier;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Erreur lors du téléchargement de la note.', err);
    }
  });
}

  // New: supports loaded from API for the selected module
  supports: any[] = [];
  moduleIdInput: number | null = null;

 get filteredCours(): CoursDoc[] {
  return this.coursPublies.filter(cours => {

    const matchSearch =
      cours.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      cours.description.toLowerCase().includes(this.searchTerm.toLowerCase());

    const matchSpecialty =
      !this.selectedSpecialty || // <-- important
      cours.module_id === Number(this.selectedSpecialty);
    return matchSearch && matchSpecialty;
  });
}

  getFormatIcon(format: string): string {
    switch(format) {
      case 'pdf': return 'bi-file-earmark-pdf-fill text-danger';
      case 'doc': return 'bi-file-earmark-word-fill text-primary';
      case 'zip': return 'bi-file-earmark-zip-fill text-warning';
      default: return 'bi-file-earmark-text-fill text-secondary';
    }
  }

  telecharger(cours: CoursDoc) {
    // Simulation du téléchargement
    console.log('Téléchargement de:', cours.titre);

    this.showSuccess = true;
    setTimeout(() => {
      this.showSuccess = false;
    }, 3000);
  }

  constructor(private http: HttpClient) {}



  // Load supports for a given module via API
  loadSupportsForModule() {
    if (!this.moduleIdInput) {
      return;
    }

    const url = `/api/modules/${this.moduleIdInput}/supports`;
    this.http.get<any[]>(url).subscribe({
      next: (res) => {
        this.supports = res;
      },
      error: (err) => {
        console.error('Failed to load supports', err);
        this.supports = [];
      }
    });
  }

  // Download support via API download route
 

  // Show support details (calls show endpoint)
  viewSupport(support: any) {
    if (!support || !support.id_module) return;
    const url = `/api/modules/${support.id_module}/supports/${support.id}`;
    this.http.get<any>(url).subscribe({
      next: (data) => {
        alert('Support: ' + (data.titre || '') + '\n' + (data.description || ''));
      },
      error: (err) => {
        console.error('Failed to fetch support details', err);
      }
    });
  }
}
