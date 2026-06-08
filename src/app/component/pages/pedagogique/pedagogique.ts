import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import AOS from 'aos';

@Component({
  selector: 'app-pedagogique',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './pedagogique.html',
  styleUrl: './pedagogique.css',
})
export class Pedagogique {
  ngOnInit(): void {
    AOS.init({ once: true });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      AOS.refresh();
    }, 100);
  }
}
