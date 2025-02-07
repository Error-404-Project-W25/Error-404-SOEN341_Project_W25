export type Role = 'admin' | 'user';

export type RegistrationData = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
};

export type UserSignInData = {
  email: string;
  password: string;
};

export type AuthStatus = {
  isSignedIn: boolean;
  uid?: string;
  errorMessage?: string;
};
