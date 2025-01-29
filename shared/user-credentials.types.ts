export type UserSignUpData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
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
