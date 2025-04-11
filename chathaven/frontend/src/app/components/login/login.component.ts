import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
import { IUser } from '@shared/interfaces';
import {
  RegistrationData,
  UserSignInData,
  UserAuthResponse,
} from '@shared/user-auth.types';
import { io } from 'socket.io-client';

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
  signInForm: UserSignInData = {email: '', password: ''};
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

  passwordVisible = false; // New property to track password visibility

  constructor(
    private router: Router,
    private backendService: BackendService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private userService: UserService
  ) {
  } // Inject ActivatedRoute

  ngOnInit() {
    // Check for query parameters when the component loads
    this.route.queryParams.subscribe((params) => {
      if (params['signup'] === 'true') {
        this.showSignInForm = false; // Show the Sign Up form instead
      }
    });

    this.userService.checkIfLoggedIn().then((isLoggedIn) => {
      if (isLoggedIn) {
        this.goToChat();
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

  // Variable to store the value of the confirm password field
  confirmPassword: string = '';

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

    if (!validEmailRegex.test(email)) {
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

  confirmPasswordMatch(): boolean {
    const pw: string = this.signUpForm.password;
    const confirmingPw: string = this.confirmPassword;

    if (!(pw && confirmingPw)) {
      this.validationErrors.passwordsMatch = false;
      this.validationErrorMessages.passwordMatchError =
        'Both password fields are required';
    } else if (pw !== confirmingPw) {
      this.validationErrorMessages.passwordMatchError =
        'Passwords do not match';
      this.validationErrors.passwordsMatch = false;
    } else {
      this.validationErrors.passwordsMatch = true;
      this.validationErrorMessages.passwordMatchError = '';
      return true;
    }
    return false;
  }

  validateSignUpForm(): boolean {
    return (
      this.validateFirstName() &&
      this.validateLastName() &&
      this.validateUsername() &&
      this.validateEmail() &&
      this.validatePassword() &&
      this.confirmPasswordMatch()
    );
  }

  /////////////////// REGISTER ///////////////////

  /////////////////// REGISTER ///////////////////

  async register() {
    if (!this.validateSignUpForm()) {
      return;
    }

    try {
      const response: UserAuthResponse | undefined =
        await this.backendService.registerUser(this.signUpForm);

      if (response) {
        if (response.uid) {
          const user: IUser | undefined = await this.backendService.getUserById(
            response.uid
          );
          if (user) {
            this.userService.setUser(user);
            const userId = user?.userId;
            const socket = io('http://localhost:3000', {
              query: { userId },
            });
            socket.on('connect', () => {
              console.log('Connected to socket server');
            });
            this.goToChat();
          }
        } else if (response.error) {
          alert(response.error); // TODO: make this a div
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
      const response: UserAuthResponse | undefined =
        await this.backendService.loginUser(this.signInForm);

      if (response) {
        if (response.uid) {
          const user: IUser | undefined = await this.backendService.getUserById(
            response.uid
          );

          if (user) {
            await this.userService.setUser(user);
            const userId = user?.userId;
            const socket = io('http://localhost:3000', {
              query: { userId },
            });
            console.log('Connected to socket server');
            this.goToChat();
          }
        } else if (response.error) {
          alert(response.error); // TODO: make this a div
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

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}
