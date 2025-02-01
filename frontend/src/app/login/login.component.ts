
import {
  Component,
  ViewEncapsulation,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  UserSignUpData,
  UserSignInData,
} from '../../../../shared/user-credentials.types';

@Component({
  selector: 'app-login',
  standalone: true, // Declare as a standalone component
  imports: [CommonModule, FormsModule], // Import dependencies
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None,
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
    role: ''
  };

  // Validation Errors
  errors = {
    firstNameInvalid: false,
    lastNameInvalid: false,
    usernameInvalid: false,
    emailInvalid: false,
    passwordInvalid: false,
    noPasswordMatch: false,
  };

  constructor(private cdr: ChangeDetectorRef, private route: ActivatedRoute) {} // Inject ActivatedRoute

  ngOnInit() {
    // Check for query parameters when the component loads
    this.route.queryParams.subscribe((params) => {
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
  validateName(event: any) {
    // Letters or hypens, 2-20 characters
    const validNameRegex: RegExp = /^(?=.*([A-Za-z]{2,}))[A-Za-z-]{2,20}$/;
    this.errors.lastNameInvalid = !validNameRegex.test(event.target.value);
  }

  validateUsername(event: any) {
    // Letters, numbers, underscore, hypen, dot, 2-15 characters
    const validUsernameRegex: RegExp = /^[A-Za-z0-9-_.]{2,15}$/;
    this.errors.usernameInvalid = !validUsernameRegex.test(event.target.value);
  }

  validateEmail(event: any) {
    // From https://emailregex.com/
    const validEmailRegex: RegExp =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    this.errors.emailInvalid = !validEmailRegex.test(event.target.value);

    console.log(this.errors);
  }

  currEnteredPassword: string = '';
  validatePassword(event: any) {
    // 8 - 20 characters, at least 1 letter upper, 1 letter lower, 1 number, 1 special character, no spaces
    // 1 uppercase, 1 lowercase, 1 number, 1 special characer, spaces not allowed
    const validPasswordRegex: RegExp =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    this.currEnteredPassword = event.target.value;
    this.errors.passwordInvalid = !validPasswordRegex.test(
      this.currEnteredPassword
    );
  }

  confirmPasswordMatch(event: any) {
    this.errors.noPasswordMatch =
      this.currEnteredPassword !== event.target.value;
  }
}
