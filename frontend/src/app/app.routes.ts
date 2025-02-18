import { Routes } from '@angular/router';
import { HomeComponent } from './component/home/home.component';
import { LoginComponent } from './component/login/login.component';
import { ChatComponent } from './component/chat/chat.component';
import { AuthGuard } from '../services/auth-guard.service';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Default route (loads home page)
  { path: 'home', component: HomeComponent }, // Explicit home route
  { path: 'login', component: LoginComponent }, // Login page route
  { path: 'chat', component: ChatComponent, canActivateChild: [AuthGuard] }, // Chat page route
];
