import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true, // Declare as a standalone component
  imports: [CommonModule, FormsModule], // Import dependencies
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  showSignInForm = true; // Toggles between Sign In and Sign Up forms
  loginError = false;

  // Data Models
  signInData = { email: '', password: '' };
  signUpData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    provider: 'false',
  };

  // Validation Errors
  errors = {
    firstName: false,
    lastName: false,
    emailEmpty: false,
    emailInvalid: false,
    password: false,
    confirmPassword: false,
  };

  toggleForm() {
    this.showSignInForm = !this.showSignInForm;
  }
}
