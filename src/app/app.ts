import { Component, signal, OnInit,ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './component/shared/navbar/navbar';
import { Home } from './component/pages/home/home';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  imports: [CommonModule,RouterOutlet, Navbar , Home],
  standalone : true,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit { 
  constructor(private cdr: ChangeDetectorRef){}
  protected readonly title = signal('Crmef');
  
  isLoading = true;

 
  ngOnInit(): void {

    setTimeout(() => {
      this.isLoading = false;

      this.cdr.detectChanges(); 

    }, 1000);

  }


}
   