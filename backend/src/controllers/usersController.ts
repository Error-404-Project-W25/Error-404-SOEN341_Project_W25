import { Request, Response } from 'express';
import { signUpUser, signInUser, signOutUser } from '../auth/authenticate';
import { User } from '../models/userModel';
import { AuthStatus } from '../../../shared/user-credentials.types';
import { IUser } from '../../../shared/interfaces';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const result: AuthStatus = await signUpUser(req.body.registrationData);
    if (result.isSignedIn) {
      // Extract user information from the request body
      const { firstName, lastName, username, email, role } =
        req.body.registrationData;
      const user_id: string = result.uid || '';

      // Store user information in MongoDB
      const newUser = new User({
        user_id,
        firstName,
        lastName,
        username,
        email,
        role,
      });

      await newUser.save();

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

export const getUserInfo = async (req: Request, res: Response) => {
  try {
    const user: IUser | null = await User.findOne({
      user_id: req.body.user_id,
    });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ error: 'Failed to get user info', details: error.message });
  }
};


export const searchUsers = async (req: Request, res: Response) => {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q : '';
    const users = await User.find({
      username: new RegExp(query, 'i') // Search by username
    });
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to search users', details: error.message });
  }
};
