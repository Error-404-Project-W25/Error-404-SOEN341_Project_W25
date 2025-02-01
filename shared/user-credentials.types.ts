export type UserSignUpData = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
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
