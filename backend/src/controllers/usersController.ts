import { Request, Response } from 'express';
import { signUpUser, signInUser, signOutUser } from '../auth/authenticate';
import { User } from '../models/userModel';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const result = await signUpUser(req.body);
    if (result.isSignedIn) {
      // Extract user information from the request body
      const { firstName, lastName, username, email, role } = req.body;
      const user_id = result.uid;

      // Store user information in MongoDB
      const newUser = new User({
        user_id,
        firstName,
        lastName,
        username,
        email,
        role: role
      });

      await newUser.save();

      res.status(201).json({
        message: 'User registered and stored in MongoDB',
        user: newUser,
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
    const result = await signInUser(req.body);
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
    const user = await User.findOne({ user_id: req.body.user_id });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get user info', details: error.message });
  }
}