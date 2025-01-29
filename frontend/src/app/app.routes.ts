import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component'; // Adjust import path if needed

export const routes: Routes = [
  { path: '', component: LoginComponent }, // Default route
  { path: 'login', component: LoginComponent }, // Optional explicit login route
];
