import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../../../core/services/api.service';
import { jsPDF } from 'jspdf';

interface Seance {
  heureDebut: string;
  heureFin: string;
  matiere: string;
  professeur: string;
  salle: string;
  type: string;
}

interface JourEmploi {
  id: string;
  nomKey: string; // clé de traduction, ex: etudiant.emploi.days.lundi
  seances: Seance[];
}

@Component({
  selector: 'app-etudiant-emploi',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './emploi.html',
  styleUrls: ['./emploi.css']
})
export class EtudiantEmploiComponent implements OnInit {
  
  jours: JourEmploi[] = [
    { id: 'lundi', nomKey: 'etudiant.emploi.days.lundi', seances: [] },
    { id: 'mardi', nomKey: 'etudiant.emploi.days.mardi', seances: [] },
    { id: 'mercredi', nomKey: 'etudiant.emploi.days.mercredi', seances: [] },
    { id: 'jeudi', nomKey: 'etudiant.emploi.days.jeudi', seances: [] },
    { id: 'vendredi', nomKey: 'etudiant.emploi.days.vendredi', seances: [] },
    { id: 'samedi', nomKey: 'etudiant.emploi.days.samedi', seances: [] }
  ];

  jourActif: JourEmploi = this.jours[0];

  constructor(
    private apiService: ApiService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadEmploi();
  }

  selectJour(jour: JourEmploi) {
    this.jourActif = jour;
  }

  downloadPDF(): void {
    const hasSeances = this.jours.some(jour => jour.seances.length > 0);
    if (!hasSeances) {
      window.alert(this.translate.instant('etudiant.emploi.noSchedule') || 'Aucun emploi du temps à télécharger.');
      return;
    }

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const title = this.translate.instant('etudiant.emploi.pageTitle') || 'Emploi du Temps';
    const generatedOn = this.translate.instant('etudiant.emploi.generatedOn') || 'Généré le';
    const labelSalle = this.translate.instant('etudiant.emploi.salle') || 'Salle';
    const labelProf = this.translate.instant('etudiant.emploi.prof') || 'Professeur';

    let y = 45;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(title, 40, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor('#6b7280');
    const now = new Date();
    const generatedText = `${generatedOn}: ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    doc.text(generatedText, 40, y + 18);
    y += 35;

    doc.setDrawColor(220);
    doc.line(40, y, 555, y);
    y += 24;

    for (const jour of this.jours) {
      const dayLabel = this.translate.instant(jour.nomKey) || jour.id;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor('#111827');
      doc.text(dayLabel, 40, y);
      y += 18;

      if (jour.seances.length === 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor('#475569');
        doc.text(this.translate.instant('etudiant.emploi.noClassToday') || 'Aucun cours prévu pour ce jour.', 46, y);
        y += 24;
      } else {
        for (const seance of jour.seances) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor('#1f2937');
          doc.text(`${seance.heureDebut} - ${seance.heureFin}`, 46, y);
          doc.text(seance.matiere, 160, y);
          y += 16;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor('#475569');
          doc.text(`${labelProf}: ${seance.professeur}`, 160, y);
          y += 14;
          doc.text(`${labelSalle}: ${seance.salle}`, 160, y);
          y += 20;

          if (y > 740) {
            doc.addPage();
            y = 45;
          }
        }
      }

      doc.setDrawColor(230);
      doc.line(40, y, 555, y);
      y += 22;
      if (y > 740) {
        doc.addPage();
        y = 45;
      }
    }

    doc.save(`emploi-du-temps-${this.formatDateForFilename(now)}.pdf`);
  }

  private formatDateForFilename(date: Date): string {
    const pad = (value: number) => value.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  private loadEmploi(): void {
    this.apiService.getStudentEmploi().subscribe({
      next: (response: any) => {
        this.jours.forEach(jour => jour.seances = []);

        (response.seances || []).forEach((seance: any) => {
          const jourId = this.normalizeDay(seance.jour);
          const jour = this.jours.find(j => j.id === jourId);
          if (jour) {
            jour.seances.push({
              heureDebut: this.formatTime(seance.heureDebut),
              heureFin: this.formatTime(seance.heureFin),
              matiere: seance.matiere,
              professeur: seance.professeur,
              salle: seance.salle,
              type: seance.type || 'cours'
            });
          }
        });

        const lundi = this.jours.find(j => j.id === 'lundi');
        this.jourActif = lundi && lundi.seances.length > 0
          ? lundi
          : this.jours.find(j => j.seances.length > 0) ?? this.jours[0];
      },
      error: (error: any) => {
        console.error('Impossible de charger l\'emploi du temps', error);
      }
    });
  }

  private normalizeDay(jour: unknown): string {
    const raw = String(jour || '').toLowerCase().trim();
    const mapping: Record<string, string> = {
      'lundi': 'lundi',
      'mardi': 'mardi',
      'mercredi': 'mercredi',
      'jeudi': 'jeudi',
      'vendredi': 'vendredi',
      'samedi': 'samedi',
      'dimanche': 'dimanche',
      'monday': 'lundi',
      'tuesday': 'mardi',
      'wednesday': 'mercredi',
      'thursday': 'jeudi',
      'friday': 'vendredi',
      'saturday': 'samedi',
      'sunday': 'dimanche'
    };
    return mapping[raw] ?? raw;
  }

  private formatTime(value: unknown): string {
    const time = String(value || '').trim();
    const match = time.match(/^(\d{1,2}:\d{2})/);
    return match ? match[1] : time;
  }
}
