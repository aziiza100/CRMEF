import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Actualites } from './composants/actualites/actualites';
import { BanniereDynamique } from './composants/banniere-dynamique/banniere-dynamique';
import { MessageDirecteur } from './composants/message-directeur/message-directeur';
import { PresentationCRMEF } from './composants/presentation-crmef/presentation-crmef';
import AOS from 'aos';
import { RouterLink } from '@angular/router';
// import 'aos/dist/aos.css';
declare var PureCounter: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Actualites, BanniereDynamique, MessageDirecteur, PresentationCRMEF, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, AfterViewInit {

  ngOnInit(): void {
    AOS.init({
      duration: 800,
      once: true
    });
  }

  ngAfterViewInit(): void {
    AOS.refresh();

    new PureCounter();
  }
 
}