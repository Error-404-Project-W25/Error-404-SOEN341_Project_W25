import { RegistrationData, UserSignInData } from '@shared/user-auth.types';
import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app';
import {
  Auth,
  UserCredential,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { AuthStatus } from '../../types/authentication.types';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.FIREBASE_API_KEY || "DUMMY_KEY",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);

/**
 * Sign up a new user
 * @param registrationData the user's registration data using the RegistrationData type
 * @returns an AuthStatus object with the user's sign in status
 */
const signUpUser = async (
  registrationData: RegistrationData
): Promise<AuthStatus> => {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      registrationData.email,
      registrationData.password
    );
    return { isSignedIn: true, uid: userCredential.user.uid };
  } catch (error: any) {
    return { isSignedIn: false, errorMessage: error.message };
  }
};

/**
 * Sign in an existing user
 * @param userSignInData the user's sign in data using the UserSignInData type
 * @returns an AuthStatus object with the user's sign in status
 */
const signInUser = async (
  userSignInData: UserSignInData
): Promise<AuthStatus> => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      userSignInData.email,
      userSignInData.password
    );
    return { isSignedIn: true, uid: userCredential.user.uid };
  } catch (error: any) {
    return { isSignedIn: false, errorMessage: error.message };
  }
};

/**
 * Sign out the current user
 * @returns an AuthStatus object with the user's sign out status
 */
const signOutUser = async (): Promise<AuthStatus> => {
  try {
    await signOut(auth);
    return { isSignedIn: false };
  } catch (error: any) {
    return {
      // See if the signout truly occurred
      isSignedIn: auth.currentUser ? true : false,
      errorMessage: error.message,
    };
  }
};

export { signInUser, signOutUser, signUpUser };
