import { IUser } from '@shared/interfaces';
import { AuthStatus } from '../../types/authentication.types';
import { Request, Response } from 'express';
import { User } from '../models/userModel';
import { signInUser, signOutUser, signUpUser } from '../utils/authenticate';
import { Team } from '../models/teamsModel';

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
      const userId: string = result.uid || '';

      // Store user information in MongoDB
      const newUser: IUser = await new User({
        userId,
        firstName,
        lastName,
        username,
        email,
        role,
      }).save();

      res.status(201).json({
        message: 'User registered and stored in MongoDB',
        uid: newUser.userId,
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
 * Get user information by userId
 * @param req userId
 * @param res returns an IUser object called 'user' (if found)
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user: IUser | null = await User.findOne({
      userId: req.params.userId,
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

/**
 * Delete a user from the database
 * @param req userId
 * @param res returns success or error message
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ userId });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // remove user from all teams
    for (let i = 0; i < user.teams.length; i++) {
      const team = await Team.findOne({ teamId: user.teams[i] });

      if (!team) {
        res.status(404).json({ error: 'Team not found' });
        return;
      }

      team.members = team.members.filter((member) => member !== userId);
    }

    // remove user from database
    await user.deleteOne();
    res.json({ success: true });
  } catch (error: any) {
    const errorMessage = error.message;
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
      details: errorMessage,
    });
    console.error('Failed to delete user', errorMessage);
  }
};

/**
 * Update the user's status
 * @param req userId, status
 * @param res returns success or error message
 */
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { userId, status } = req.body;

    const user = await User.findOne({ userId });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (status === 'offline') {
      user.lastSeen = new Date();
    }

    user.status = status;
    await user.save();

    res.json({ 
      success: true ,
      message:
        `The user status has been updated successfully to ${status}`,
    });

  } catch (error: any) {
    const errorMessage = error.message;
    res.status(500).json({
      success: false,
      error: 'Failed to update status',
      details: errorMessage,
    });
    console.error('Failed to update status', errorMessage);
  }
};

