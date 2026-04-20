import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './component/shared/navbar/navbar';
import { Home } from './component/pages/home/home';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar , Home],
  standalone : true,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { 
  protected readonly title = signal('Crmef');
}
   