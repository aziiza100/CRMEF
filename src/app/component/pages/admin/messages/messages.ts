import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

interface Message {
  id: number;
  expediteur: string;
  email: string;
  sujet: string;
  contenu: string;
  date: string;
  lu: boolean;
  avatar: string;
}

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './messages.html',
  styleUrls: ['./messages.css']
})
export class AdminMessagesComponent {
  
  searchTerm = '';
  selectedMessage: Message | null = null;

  messages: Message[] = [
    {
      id: 1,
      expediteur: 'Fatima Zahra',
      email: 'fatima.zahra@email.com',
      sujet: 'Question sur les emplois du temps',
      contenu: 'Bonjour, je voudrais savoir si les emplois du temps du deuxième semestre seront bientôt disponibles sur la plateforme. Merci d\'avance pour votre retour.',
      date: 'Aujourd\'hui, 10:23',
      lu: false,
      avatar: 'https://ui-avatars.com/api/?name=Fatima+Zahra&background=random'
    },
    {
      id: 2,
      expediteur: 'Karim Alaoui',
      email: 'karim@gmail.com',
      sujet: 'Problème de connexion à mon espace',
      contenu: 'Bonjour l\'administration, j\'ai perdu mon mot de passe et je n\'arrive plus à me connecter à mon espace étudiant pour consulter mes notes. Pouvez-vous m\'aider ?',
      date: 'Hier, 15:40',
      lu: false,
      avatar: 'https://ui-avatars.com/api/?name=Karim+Alaoui&background=random'
    },
    {
      id: 3,
      expediteur: 'Société Informatique X',
      email: 'contact@six.ma',
      sujet: 'Proposition de partenariat équipement',
      contenu: 'Madame, Monsieur le Directeur. Nous sommes une entreprise spécialisée dans la vente de matériel pédagogique et nous souhaitons vous proposer un devis pour vos salles TICE...',
      date: 'Il y a 3 jours',
      lu: true,
      avatar: 'https://ui-avatars.com/api/?name=Societe+Informatique&background=0f172a&color=fff'
    }
  ];

  get filteredMessages() {
    return this.messages.filter(m => 
      m.expediteur.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
      m.sujet.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get unreadCount() {
    return this.messages.filter(m => !m.lu).length;
  }

  selectMessage(msg: Message) {
    this.selectedMessage = msg;
    if (!msg.lu) {
      msg.lu = true;
    }
  }

  deleteMessage(id: number) {
    if (confirm('Supprimer ce message définitivement ?')) {
      this.messages = this.messages.filter(m => m.id !== id);
      if (this.selectedMessage?.id === id) {
        this.selectedMessage = null;
      }
    }
  }

  replyToMessage() {
    if (this.selectedMessage) {
      window.location.href = `mailto:${this.selectedMessage.email}?subject=RE: ${this.selectedMessage.sujet}`;
    }
  }
}
