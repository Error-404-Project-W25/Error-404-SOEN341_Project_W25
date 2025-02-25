import { IUser } from '@shared/interfaces';
import { AuthStatus } from '../../types/authentication.types';
import { Request, Response } from 'express';
import { User } from '../models/userModel';
import { signInUser, signOutUser, signUpUser } from '../utils/authenticate';

////////////////////////// AUTHENTICATION //////////////////////////

/**
 * Sign up a new user and store their information in MongoDB
 * @param req user RegistrationData
 * @param res returns a UserAuthResponse
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const result: AuthStatus = await signUpUser(req.body.registrationData);

    if (result.isSignedIn) {
      const { firstName, lastName, username, email, role } =
        req.body.registrationData;
      const user_id: string = result.uid || '';

      // Store user information in MongoDB
      const newUser: IUser = await new User({
        user_id,
        firstName,
        lastName,
        username,
        email,
        role,
      }).save();

      res.status(201).json({
        message: 'User registered and stored in MongoDB',
        uid: newUser.user_id,
      });
    } else {
      res.status(400).json({
        error: 'Failed to register user',
        details: result.errorMessage,
      });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ error: 'Failed to register user', details: error.message });
  }
};

/**
 * Signs in an existing user
 * @param req user UserSignInData
 * @param res returns a UserAuthResponse
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const result: AuthStatus = await signInUser(req.body.signInData);

    if (result.isSignedIn) {
      res.status(200).json({ message: 'User signed in', uid: result.uid });
    } else {
      res.status(400).json({
        error: 'Failed to sign in user',
        details: result.errorMessage,
      });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ error: 'Failed to sign in user', details: error.message });
  }
};

/**
 * Signs out a user
 * @param req user UserSignInData
 * @param res returns a UserAuthResponse
 */
export const logoutUser = async (_: Request, res: Response) => {
  try {
    const result = await signOutUser();

    if (!result.isSignedIn) {
      res.status(200).json({ message: 'User signed out' });
    } else {
      res.status(400).json({
        error: 'Failed to sign out user',
        details: result.errorMessage,
      });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ error: 'Failed to sign out user', details: error.message });
  }
};

////////////////////////// USERS //////////////////////////

/**
 * Get user information by user_id
 * @param req user_id
 * @param res returns an IUser object called 'user' (if found)
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user: IUser | null = await User.findOne({
      user_id: req.params.user_id,
    });
    if (user) {
      res.status(200).json({ user });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ error: 'Failed to get user info', details: error.message });
  }
};

/**
 * Get user information by username
 * @param req username
 * @param res returns array of matching IUser objects called 'users'
 */
export const getUserByUsername = async (req: Request, res: Response) => {
  try {
    const query: string = req.params.username as string;
    const users: IUser[] | null = await User.find({
      username: new RegExp(query, 'i'), // Search by username
    });
    res.status(200).json({ users });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: 'Failed to search users', details: error.message });
  }
};
