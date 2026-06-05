import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-content',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './content.html',
  styleUrls: ['./content.css']
})
export class AdminContentComponent {
  
  activeTab: 'actualites' | 'evenements' | 'annonces' = 'actualites';
  searchTerm = '';
  
  showModal = false;
  editingId: number | null = null;
  toastMessage = '';
  showToast = false;

  // Modèle Bilingue de publication
  newArticle = {
    titreFr: '',
    titreAr: '',
    descFr: '',
    descAr: '',
    imageUrl: '',
    status: 'published' // published ou draft
  };

  articles = [
    { 
      id: 1, 
      type: 'actualites', 
      titreFr: 'Nouveaux équipements pour la salle TICE', 
      titreAr: 'معدات جديدة لقاعة الإعلاميات', 
      date: '12 Nov 2023', 
      status: 'published', 
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=150&h=100&fit=crop' 
    },
    { 
      id: 2, 
      type: 'evenements', 
      titreFr: 'Journée d\'intégration des nouveaux stagiaires', 
      titreAr: 'يوم إدماج المتدربين الجدد', 
      date: '05 Sep 2023', 
      status: 'published', 
      imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=150&h=100&fit=crop' 
    },
    { 
      id: 3, 
      type: 'annonces', 
      titreFr: 'Dépôt des mémoires de fin de formation', 
      titreAr: 'إيداع بحوث نهاية التكوين', 
      date: 'Hier', 
      status: 'draft', 
      imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=150&h=100&fit=crop' 
    }
  ];

  get filteredArticles() {
    return this.articles.filter(a => {
      const matchType = a.type === this.activeTab;
      const matchSearch = a.titreFr.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                          a.titreAr.includes(this.searchTerm);
      return matchType && matchSearch;
    });
  }

  switchTab(tab: 'actualites' | 'evenements' | 'annonces') {
    this.activeTab = tab;
    this.searchTerm = '';
  }

  openModal(article?: any) {
    if (article) {
      this.editingId = article.id;
      this.newArticle = { 
        titreFr: article.titreFr, 
        titreAr: article.titreAr, 
        descFr: article.descFr || '', 
        descAr: article.descAr || '', 
        imageUrl: article.imageUrl || '',
        status: article.status
      };
    } else {
      this.editingId = null;
      this.newArticle = { titreFr: '', titreAr: '', descFr: '', descAr: '', imageUrl: '', status: 'published' };
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  toggleStatus(article: any) {
    article.status = article.status === 'published' ? 'draft' : 'published';
    this.triggerToast(article.status === 'published' ? 'Article publié en ligne !' : 'Article passé en brouillon.');
  }

  saveArticle() {
    if (this.editingId) {
      const idx = this.articles.findIndex(a => a.id === this.editingId);
      this.articles[idx] = { 
        ...this.articles[idx], 
        titreFr: this.newArticle.titreFr, 
        titreAr: this.newArticle.titreAr, 
        imageUrl: this.newArticle.imageUrl || 'https://placehold.co/150x100?text=Sans+Image', 
        status: this.newArticle.status 
      };
    } else {
      this.articles.unshift({
        id: Date.now(),
        type: this.activeTab,
        titreFr: this.newArticle.titreFr,
        titreAr: this.newArticle.titreAr,
        date: 'Aujourd\'hui',
        status: this.newArticle.status,
        imageUrl: this.newArticle.imageUrl || 'https://placehold.co/150x100?text=Image'
      });
    }
    
    this.closeModal();
    this.triggerToast(this.editingId ? 'Modification sauvegardée.' : 'Publication réussie.');
  }

  deleteArticle(id: number) {
    if (confirm("Supprimer définitivement cet article ?")) {
      this.articles = this.articles.filter(a => a.id !== id);
      this.triggerToast('Article supprimé.');
    }
  }

  triggerToast(msg: string) {
    this.toastMessage = msg;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
