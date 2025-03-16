import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ChatComponent } from './components/chat/chat.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Default route (loads home page)
  { path: 'home', component: HomeComponent }, // Explicit home route
  { path: 'login', component: LoginComponent }, // Login page route
  { path: 'chat', component: ChatComponent }, // Chat page route
];
