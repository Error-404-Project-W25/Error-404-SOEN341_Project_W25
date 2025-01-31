import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Default route (loads home page)
  { path: 'home', component: HomeComponent }, // Explicit home route
  { path: 'login', component: LoginComponent } // Login page route
];
