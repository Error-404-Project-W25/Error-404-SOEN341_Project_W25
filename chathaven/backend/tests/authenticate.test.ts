import {
  RegistrationData,
  UserSignInData,
  //AuthStatus,
} from '../../shared/user-auth.types';
import { AuthStatus } from '../../backend/types/authentication.types'
import { signUpUser, signInUser, signOutUser } from '../src/utils/authenticateUtils';

const runAuthTests = async (): Promise<void> => {
  const randomSeed: number = Math.random();

  const testUser: RegistrationData = {
    firstName: `Test${randomSeed}`,
    lastName: `Testman${randomSeed}`,
    username: `test${randomSeed}`,
    email: `${randomSeed}test@testsuite.com`,
    password: '12345678',
    role: 'admin',
  };

  const testUserValidSignInData: UserSignInData = {
    email: `${randomSeed}test@testsuite.com`,
    password: '12345678',
  };

  const testUserInvalidSignInData: UserSignInData = {
    email: `${randomSeed}test@testsuite.com`,
    password: '87654321',
  };

  // Sign up
  const signUp: AuthStatus = await signUpUser(testUser);
  logStatus(signUp);
  console.log(signUp.isSignedIn ? 'Pass' : 'Fail');

  // Sign out
  const signOut: AuthStatus = await signOutUser();
  logStatus(signOut);
  console.log(signOut.isSignedIn ? 'Fail' : 'Pass');

  // Try to sign in with invalid credentials
  const badSignIn: AuthStatus = await signInUser(testUserInvalidSignInData);
  logStatus(badSignIn);
  console.log(badSignIn.isSignedIn ? 'Fail' : 'Pass');

  // Sign in user with good credentials
  const goodSignIn: AuthStatus = await signInUser(testUserValidSignInData);
  logStatus(goodSignIn);
  console.log(goodSignIn.isSignedIn ? 'Pass' : 'Fail');
};

const logStatus = (status: AuthStatus): void => {
  console.log('----------------------------------------------');
  console.log(status.isSignedIn ? 'Signed in' : 'Not signed in');
  console.log('UID:', status.uid);
  console.log('Error message:', status.errorMessage || 'None');
  console.log('----------------------------------------------');
};

export { runAuthTests };
