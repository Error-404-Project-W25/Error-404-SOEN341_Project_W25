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
  RegistrationData,
  UserSignInData,
} from '../../../../shared/user-credentials.types';
import { BackendService } from '../../services/backend.service';
import { Router } from '@angular/router';
import { UserAuthResponse } from '../../types/http-response.types';
import { IUser } from '../../../../shared/interfaces';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true, // Declare as a standalone component
  imports: [CommonModule, FormsModule], // Import dependencies
  providers: [BackendService], // Provide the BackendService
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent implements OnInit {
  showSignInForm = true; // By default, show the Sign In form
  loginError = false;

  // Data Models
  signInForm: UserSignInData = { email: '', password: '' };
  signUpForm: RegistrationData = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    role: 'user', // default
  };

  validationErrors = {
    firstNameValid: false,
    lastNameValid: false,
    usernameValid: false,
    emailValid: false,
    passwordValid: false,
    passwordsMatch: false,
  };

  validationErrorMessages = {
    firstNameError: '',
    lastNameError: '',
    usernameError: '',
    emailError: '',
    passwordError: '',
    passwordMatchError: '',
  };

  constructor(
    private router: Router,
    private backendService: BackendService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private userService: UserService
  ) {} // Inject ActivatedRoute

  ngOnInit() {
    // Check for query parameters when the component loads
    this.route.queryParams.subscribe((params) => {
      if (params['signup'] === 'true') {
        this.showSignInForm = false; // Show the Sign Up form instead
      }
    });

    this.cdr.detectChanges(); // Ensure UI updates correctly
  }

  goToChat() {
    this.router.navigate(['/chat']);
  }

  toggleForm() {
    this.showSignInForm = !this.showSignInForm;
    this.cdr.detectChanges(); // Force UI update
  }

  ///////////////////// VALIDATION /////////////////////

  validateName(val: string): string {
    const validNameRegex: RegExp = /^[A-Za-z-]*[A-Za-z]{2,}[A-Za-z-]*$/;

    let error: string = '';

    if (val.length < 2) {
      error = 'name is too short';
    } else if (val.length > 20) {
      error = 'name is too long';
    } else if (!validNameRegex.test(val)) {
      error = 'name must only contains letters or hyphens';
    }

    return error;
  }

  validateFirstName(): boolean {
    let nameError: string = this.validateName(this.signUpForm.firstName);

    if (nameError.length) {
      this.validationErrors.firstNameValid = false;
      this.validationErrorMessages.firstNameError = 'First ' + nameError;
      return false;
    } else {
      this.validationErrors.firstNameValid = true;
      return true;
    }
  }

  validateLastName(): boolean {
    let nameError: string = this.validateName(this.signUpForm.lastName);

    if (nameError.length) {
      this.validationErrors.lastNameValid = false;
      this.validationErrorMessages.lastNameError = 'Last ' + nameError;
      return false;
    } else {
      this.validationErrors.lastNameValid = true;
      return true;
    }
  }

  validateUsername(): boolean {
    const username: string = this.signUpForm.username;
    const validUsernameRegex: RegExp = /^[A-Za-z0-9-_.]+$/;

    let error: string = '';

    if (username.length < 2) {
      error = 'Username is too short';
    } else if (username.length > 15) {
      error = 'Username is too long';
    } else if (!validUsernameRegex.test(username)) {
      error =
        'name can only contain letters, numbers, dashes, underscores or periods';
    }

    if (error.length) {
      this.validationErrors.usernameValid = false;
      this.validationErrorMessages.usernameError = error;
      return false;
    } else {
      this.validationErrors.usernameValid = true;
      return true;
    }
  }

  validateEmail(): boolean {
    const email: string = this.signUpForm.email;
    const validEmailRegex: RegExp =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (email.length > 0 && !validEmailRegex.test(email)) {
      this.validationErrors.emailValid = false;
      this.validationErrorMessages.emailError = 'Invalid email';
      return false;
    } else {
      this.validationErrors.emailValid = true;
      return true;
    }
  }

  validatePassword(): boolean {
    const pw: string = this.signUpForm.password;
    let error: string = '';

    if (pw.length < 8) {
      error = 'Password is too short';
    } else if (pw.length > 20) {
      error = 'Password is too long';
    } else if (!/[A-Z]/.test(pw)) {
      error = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(pw)) {
      error = 'Password must contain at least one lowercase letter';
    } else if (!/\d/.test(pw)) {
      error = 'Password must contain at least one number';
    } else if (!/[@$!%*?&]/.test(pw)) {
      error = 'Password must contain at least one special character (@$!%*?&)';
    } else if (/\s/.test(pw)) {
      error = 'Password cannot contain spaces';
    }

    if (error.length) {
      this.validationErrorMessages.passwordError = error;
      this.validationErrors.passwordValid = false;
      return false;
    } else {
      this.validationErrors.passwordValid = true;
      return true;
    }
  }

  confirmPasswordMatch(event: any): boolean {
    const input: string = event.target.value as string;
    const pw: string = this.signUpForm.password;

    if (pw.length > 0 && input.length > 0 && pw !== input) {
      this.validationErrors.passwordsMatch = false;
      this.validationErrorMessages.passwordMatchError =
        'Passwords do not match';
      return false;
    } else {
      this.validationErrors.passwordsMatch = true;
      return true;
    }
  }

  validateAllFields(): boolean {
    return (
      this.validateFirstName() &&
      this.validateLastName() &&
      this.validateUsername() &&
      this.validateEmail() &&
      this.validatePassword()
    );
  }

  /////////////////// REGISTER ///////////////////

  async register() {
    for (let field in this.signUpForm) {
      if (!field) {
        alert('Please fill in all required fields');
        return;
      }
    }

    if (!this.validateAllFields()) {
      return;
    }

    try {
      const response: UserAuthResponse | null =
        await this.backendService.registerUser(this.signUpForm);

      if (response) {
        if (response.uid) {
          const user: IUser | null = await this.backendService.getUserInfo(
            response.uid
          );

          if (user) {
            this.userService.loadUser(user.user_id);
            this.goToChat();
          }
        } else if (response.error) {
          // should write in a div eventually
          console.log('Error:', response.error);
          console.log('Details:', response.details);
        }
        console.log('Message:', response.message);
      }
    } catch (error) {
      console.error('Error registering user:', error);
      alert('Failed to register user.');
    }
  }

  //////////////////// LOGIN ////////////////////

  async login() {
    if (!this.signInForm.email || !this.signInForm.password) {
      alert('Email and password are required.');
      return;
    }

    try {
      // Send login request to the backend
      const response: UserAuthResponse | null =
        await this.backendService.loginUser(this.signInForm);

      if (response) {
        if (response.uid) {
          const user: IUser | null = await this.backendService.getUserInfo(
            response.uid
          );

          if (user) {
            this.userService.loadUser(user.user_id);
            this.goToChat();
          }
        } else if (response.error) {
          // should write in a div eventually
          console.log('Error:', response.error);
          console.log('Details:', response.details);
        }
        console.log('Message:', response.message);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Failed to log in.');
    }
  }
}
