import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router, Routes } from '@angular/router';
import { HomeComponent } from './component/home/home.component';
import { LoginComponent } from './component/login/login.component';
import { ChatComponent } from './component/chat/chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'ChatHaven';
  // Define the routes directly in the component
  public routes: Routes = [
    { path: '', component: HomeComponent }, // Default route
    { path: 'home', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'chat', component: ChatComponent },
  ];
  constructor(private router: Router) {
    this.router.config = this.routes; // Set the routes directly on the router
  }
}
