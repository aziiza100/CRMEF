import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import AOS from 'aos';

@Component({
  selector: 'app-formation',
  imports: [CommonModule, RouterModule, TranslateModule],
  standalone: true,
  templateUrl: './formation.html',
  styleUrl: './formation.css',
})
export class Formation {
  translate = inject(TranslateService);

  ngOnInit(): void {
    AOS.init({ once: true });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      AOS.refresh();
    }, 100);
  }
}
