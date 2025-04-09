import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './login.component';
import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
import { Router } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  const mockBackendService = {
    loginUser: jasmine
      .createSpy('loginUser')
      .and.returnValue(
        Promise.resolve({ uid: 'sehcJfO3kFdNmgh4vOfEOyJxEEr1' })
      ),
    getUserById: jasmine.createSpy('getUserById').and.returnValue(
      Promise.resolve({
        userId: 'sehcJfO3kFdNmgh4vOfEOyJxEEr1',
        username: 'charlie.brown',
        email: 'charlie@email.com',
        role: 'admin',
      })
    ),
  };

  const mockUserService = {
    setUser: jasmine.createSpy('setUser'),
    checkIfLoggedIn: jasmine
      .createSpy('checkIfLoggedIn')
      .and.returnValue(Promise.resolve(false)),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule, HttpClientModule],
      providers: [
        { provide: BackendService, useValue: mockBackendService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle between Sign In and Sign Up forms', () => {
    // Initially, the Sign In form should be displayed
    expect(component.showSignInForm).toBeTrue();

    // Toggle to Sign Up form
    component.toggleForm();
    expect(component.showSignInForm).toBeFalse();

    // Toggle back to Sign In form
    component.toggleForm();
    expect(component.showSignInForm).toBeTrue();
  });

  it('should toggle password visibility', () => {
    // Initially, passwordVisible should be false
    expect(component.passwordVisible).toBeFalse();

    // Toggle password visibility
    component.togglePasswordVisibility();
    expect(component.passwordVisible).toBeTrue();

    // Toggle back to hide password
    component.togglePasswordVisibility();
    expect(component.passwordVisible).toBeFalse();
  });

  it('should validate first name correctly', () => {
    component.signUpForm.firstName = 'John';
    expect(component.validateFirstName()).toBeTrue();

    component.signUpForm.firstName = 'J';
    expect(component.validateFirstName()).toBeFalse();

    component.signUpForm.firstName = 'John123';
    expect(component.validateFirstName()).toBeFalse();
  });

  it('should validate last name correctly', () => {
    component.signUpForm.lastName = 'Doe';
    expect(component.validateLastName()).toBeTrue();

    component.signUpForm.lastName = 'D';
    expect(component.validateLastName()).toBeFalse();

    component.signUpForm.lastName = 'Doe@';
    expect(component.validateLastName()).toBeFalse();
  });

  it('should validate username correctly', () => {
    component.signUpForm.username = 'valid_user';
    expect(component.validateUsername()).toBeTrue();

    component.signUpForm.username = 'x';
    expect(component.validateUsername()).toBeFalse();

    component.signUpForm.username = 'invalid@user';
    expect(component.validateUsername()).toBeFalse();
  });

  it('should validate email correctly', () => {
    component.signUpForm.email = 'test@example.com';
    expect(component.validateEmail()).toBeTrue();

    component.signUpForm.email = 'invalid-email';
    expect(component.validateEmail()).toBeFalse();
  });

  it('should validate password correctly', () => {
    component.signUpForm.password = 'Valid123!';
    expect(component.validatePassword()).toBeTrue();

    component.signUpForm.password = 'short';
    expect(component.validatePassword()).toBeFalse();

    component.signUpForm.password = 'NoSpecialChar123';
    expect(component.validatePassword()).toBeFalse();
  });

  it('should validate password match correctly', () => {
    component.signUpForm.password = 'Valid123!';
    component.confirmPassword = 'Valid123!';
    expect(component.confirmPasswordMatch()).toBeTrue();

    component.confirmPassword = 'Invalid123!';
    expect(component.confirmPasswordMatch()).toBeFalse();
  });

  it('should call login and navigate to chat on successful login with valid credentials', async () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    component.signInForm.email = 'charlie@email.com';
    component.signInForm.password = 'Password123!';

    // Trigger change detection to ensure bindings are updated
    fixture.detectChanges();

    await component.login(); // Wait for the login method to complete

    expect(mockUserService.setUser).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/chat']);
  });

  it('should not navigate to chat on unsuccessful login with invalid credentials', async () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    component.signInForm.email = 'invalid@email.com';
    component.signInForm.password = 'WrongPassword!';

    // Mock the loginUser method to return a rejected promise
    mockBackendService.loginUser.and.returnValue(
      Promise.reject('Invalid credentials')
    );

    // Trigger change detection to ensure bindings are updated
    fixture.detectChanges();

    await component.login(); // Wait for the login method to complete

    expect(mockUserService.setUser).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should call sign up and navigate to chat on successful sign-up with valid credentials', async () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    component.signUpForm = {
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john.doe@email.com',
      password: 'Valid123!',
      role: 'user', // Added role property
    };
    component.confirmPassword = 'Valid123!';

    // Mock the sign-up method to return a resolved promise
    mockBackendService.loginUser.and.returnValue(
      Promise.resolve({ uid: 'newUserId123' })
    );

    // Mock getUserById to return a valid user object
    mockBackendService.getUserById.and.returnValue(
      Promise.resolve({
        userId: 'newUserId123',
        username: 'johndoe',
        email: 'john.doe@email.com',
        role: 'user',
      })
    );

    // Trigger change detection to ensure bindings are updated
    fixture.detectChanges();

    await component.register(); // Wait for the sign-up method to complete

    expect(mockUserService.setUser).toHaveBeenCalledWith({
      userId: 'newUserId123',
      username: 'johndoe',
      email: 'john.doe@email.com',
      role: 'user',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/chat']);
  });

  it('should not navigate to chat on unsuccessful sign-up with invalid credentials', async () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    component.signUpForm = {
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'invalid-email',
      password: 'short',
      role: 'user', // Added role property
    };
    component.confirmPassword = 'short1'; // Ensure confirmPassword matches password

    // Mock the sign-up method to return a rejected promise
    mockBackendService.loginUser.and.returnValue(
      Promise.reject('Invalid sign-up details')
    );

    // Trigger change detection to ensure bindings are updated
    fixture.detectChanges();

    await component.register(); // Wait for the sign-up method to complete

    expect(mockUserService.setUser).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
