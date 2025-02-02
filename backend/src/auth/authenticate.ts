import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  Auth,
  UserCredential,
  signOut,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  AuthStatus,
  UserSignInData,
  RegistrationData,
} from '../../../shared/user-credentials.types';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);

const signUpUser = async (
  registrationData: RegistrationData
): Promise<AuthStatus> => {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      registrationData.email,
      registrationData.password
    );
    // User also gets signed in automatically
    return { isSignedIn: true, uid: userCredential.user.uid };
  } catch (error: any) {
    return { isSignedIn: false, errorMessage: error.message };
  }
};

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

export { signUpUser, signInUser, signOutUser };
