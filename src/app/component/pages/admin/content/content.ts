import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService, Actualite } from '../../../../core/services/api.service';
import { PaginationComponent } from '../../../shared/pagination/pagination';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-admin-content',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PaginationComponent],
  templateUrl: './content.html',
  styleUrls: ['./content.css']
})
export class AdminContentComponent implements OnInit {
  
  activeTab: 'actualites' | 'evenements' | 'annonces' = 'actualites';
  searchTerm = '';
  
  showModal = false;
  editingId: number | null = null;
  isLoading = false;
  isSaving = false;

  currentPage = 1;
  pageSize = 10;

  // Selected file for upload
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  // Modèle Bilingue de publication
  newArticle = {
    titreFr: '',
    titreAr: '',
    descFr: '',
    descAr: '',
    date: '',
    heure: '',
    imageUrl: '',
    status: 'published' // published ou draft
  };

  articles: any[] = [];

  constructor(
    private api: ApiService, 
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadArticles();
  }

  loadArticles() {
    this.isLoading = true;
    this.api.getActualites().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.data) {
          this.articles = res.data.map((a: any) => this.mapArticle(a));
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.error(this.toast.getErrorMessage(err, 'Erreur lors du chargement des articles.'));
      }
    });
  }

  mapArticle(a: any) {
    const titreParts = a.titre ? a.titre.split(' ||| ') : ['', ''];
    const descParts = a.description ? a.description.split(' ||| ') : ['', ''];
    return {
      id: a.id,
      type: a.type || 'actualites',
      titreFr: a.titre || titreParts[0] || '',
      titreAr: a.titre_arabe || titreParts[1] || '',
      descFr: a.description || descParts[0] || '',
      descAr: a.description_arabe || descParts[1] || '',
      date: a.date,
      status: (a.publie === true || a.publie === 1 || a.publie === '1') ? 'published' : 'draft', 
      imageUrl: a.image_base64 || 'assets/images/actualites/actualite1.jpg'
    };
  }

  get filteredArticles() {
    return this.articles.filter(a => {
      const matchType = a.type === this.activeTab;
      const matchSearch = a.titreFr.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                          a.titreAr.includes(this.searchTerm);
      return matchType && matchSearch;
    });
  }

  get paginatedArticles() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredArticles.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  switchTab(tab: 'actualites' | 'evenements' | 'annonces') {
    this.activeTab = tab;
    this.searchTerm = '';
    this.currentPage = 1;
  }

  @HostListener('window:admin-reset-content-tab')
  onResetTab() {
    this.activeTab = 'actualites';
    this.cdr.detectChanges();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  openModal(article?: any) {
    if (article) {
      this.editingId = article.id;
      this.newArticle = { 
        titreFr: article.titreFr, 
        titreAr: article.titreAr, 
        descFr: article.descFr || '', 
        descAr: article.descAr || '', 
        date: article.date || '',
        heure: article.heure || '',
        imageUrl: article.imageUrl || '',
        status: article.status || 'published'
      };
      this.imagePreview = article.imageUrl;
    } else {
      this.editingId = null;
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const currentHeure = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      this.newArticle = { 
        titreFr: '', 
        titreAr: '', 
        descFr: '', 
        descAr: '', 
        date: today, 
        heure: currentHeure, 
        imageUrl: '', 
        status: 'published' 
      };
      this.selectedFile = null;
      this.imagePreview = null;
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedFile = null;
    this.imagePreview = null;
    this.editingId = null;
  }

  toggleStatus(article: any) {
    const newStatus = article.status === 'published' ? 'draft' : 'published';
    const isPublie = newStatus === 'published';
    
    this.api.updateActualite(article.id, { publie: isPublie }).subscribe({
      next: () => {
        article.status = newStatus;
        this.toast.success(`Statut mis à jour : ${newStatus === 'published' ? 'Publié' : 'Brouillon'}`);
      },
      error: (err) => {
        this.toast.error(this.toast.getErrorMessage(err, 'Erreur lors de la modification du statut.'));
      }
    });
  }

  saveArticle() {
    if (!this.newArticle.titreFr || !this.newArticle.titreAr) {
      return;
    }

    const wasEditing = !!this.editingId;
    this.isSaving = true;
    const formData = new FormData();
    formData.append('type', this.activeTab);
    formData.append('titre', this.newArticle.titreFr);
    formData.append('titre_arabe', this.newArticle.titreAr);
    formData.append('description', this.newArticle.descFr);
    formData.append('description_arabe', this.newArticle.descAr);
    formData.append('date', this.newArticle.date);
    
    if (this.newArticle.heure) {
      formData.append('heure', this.newArticle.heure);
    }

    formData.append('publie', this.newArticle.status === 'published' ? '1' : '0');

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const request$ = this.editingId
      ? this.api.updateActualite(this.editingId, formData)
      : this.api.createActualite(formData);

    // Capture state to restore in case of failure
    const prevTitreFr = this.newArticle.titreFr;
    const prevTitreAr = this.newArticle.titreAr;
    const prevDescFr = this.newArticle.descFr;
    const prevDescAr = this.newArticle.descAr;
    const prevDate = this.newArticle.date;
    const prevHeure = this.newArticle.heure;
    const prevStatus = this.newArticle.status;
    const prevEditingId = this.editingId;
    const prevSelectedFile = this.selectedFile;
    const prevImagePreview = this.imagePreview;

    // Close the modal window immediately
    this.showModal = false;
    this.toast.info(wasEditing ? 'Modification en cours...' : 'Publication en cours...');

    request$.subscribe({
      next: (res) => {
        this.isSaving = false;
        this.selectedFile = null;
        this.imagePreview = null;
        this.editingId = null;

        if (res && res.data) {
          const mapped = this.mapArticle(res.data);
          if (wasEditing) {
            const index = this.articles.findIndex(a => a.id === mapped.id);
            if (index !== -1) {
              this.articles[index] = mapped;
            }
          } else {
            // Prepend new article to display immediately
            this.articles.unshift(mapped);
          }
        }

        this.toast.success(wasEditing ? 'La modification a été sauvegardée avec succès.' : 'La publication a été réussie.');
        this.loadArticles(); // Silently sync background state
      },
      error: (err) => {
        this.isSaving = false;
        // Restore state so user doesn't lose inputs on error
        this.editingId = prevEditingId;
        this.newArticle = {
          titreFr: prevTitreFr,
          titreAr: prevTitreAr,
          descFr: prevDescFr,
          descAr: prevDescAr,
          date: prevDate,
          heure: prevHeure,
          imageUrl: prevImagePreview || '',
          status: prevStatus
        };
        this.selectedFile = prevSelectedFile;
        this.imagePreview = prevImagePreview;
        this.showModal = true;

        this.toast.error(this.toast.getErrorMessage(err, 'Erreur lors de l\'enregistrement de la publication.'));
      }
    });
  }

  deleteArticle(id: number) {
    if (confirm("Supprimer définitivement cet article ?")) {
      const index = this.articles.findIndex(a => a.id === id);
      if (index === -1) return;

      const deletedArticle = this.articles[index];
      
      // Remove instantly from frontend list
      this.articles.splice(index, 1);
      this.toast.success('L\'article a été supprimé avec succès.');

      this.api.deleteActualite(id).subscribe({
        next: () => {
          // Perfectly deleted in backend
        },
        error: (err) => {
          // Restore if backend fails
          this.articles.splice(index, 0, deletedArticle);
          this.toast.error(this.toast.getErrorMessage(err, 'Erreur lors de la suppression de l\'article.'));
        }
      });
    }
  }
}
