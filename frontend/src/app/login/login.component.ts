import { Component, ViewEncapsulation, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true, // Declare as a standalone component
  imports: [CommonModule, FormsModule], // Import dependencies
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {
  showSignInForm = true; // By default, show the Sign In form
  loginError = false;

  // Data Models
  signInData = { username: '', password: '' };
  signUpData = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: ''
  };

  // Validation Errors
  errors = {
    firstName: false,
    lastName: false,
    username: false,
    emailEmpty: false,
    emailInvalid: false,
    password: false,
    confirmPassword: false,
  };

  constructor(private cdr: ChangeDetectorRef, private route: ActivatedRoute, private router: Router) {} // Inject ActivatedRoute

  ngOnInit() {
    // Check for query parameters when the component loads
    this.route.queryParams.subscribe(params => {
      if (params['signup'] === 'true') {
        this.showSignInForm = false; // Show the Sign Up form instead
      }
    });

    this.cdr.detectChanges(); // Ensure UI updates correctly
  }

  toggleForm() {
    this.showSignInForm = !this.showSignInForm;
    this.cdr.detectChanges(); // Force UI update
  }

  goToChat() {
    this.router.navigate(['/chat']);  // Navigates to the '/server' route
  }
}
