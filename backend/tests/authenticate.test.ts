import {
  UserSignUpData,
  UserSignInData,
  AuthStatus,
} from '../../shared/user-credentials.types';
import { signUpUser, signInUser, signOutUser } from '../auth/authenticate';

const runAuthTests = async (): Promise<void> => {
  const testUser: UserSignUpData = {
    firstName: 'Test',
    lastName: 'Testman',
    email: 'test@testsuite.com',
    password: '12345678',
  };

  const testUserValidSignInData: UserSignInData = {
    email: 'test@testsuite.com',
    password: '12345678',
  };

  const signup: AuthStatus = await signUpUser(testUser);
  console.log(signup.errorMessage);

  // Add more tests
};

export { runAuthTests };
