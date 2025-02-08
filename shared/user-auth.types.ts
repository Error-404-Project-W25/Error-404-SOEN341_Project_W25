export type Role = 'admin' | 'user';

export type RegistrationData = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: Role;
};

export type UserSignInData = {
  email: string;
  password: string;
};

export type UserAuthResponse = {
  message?: string;
  uid?: string;
  error?: string;
  details?: string;
};
