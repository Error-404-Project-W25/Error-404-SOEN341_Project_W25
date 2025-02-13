import mongoose, { Schema } from 'mongoose';
import { teamSchema } from './teamsModel';
import { IUser } from '../../../shared/interfaces';

// User Schema
const userSchema: Schema = new Schema(
  {
    user_id: { type: String, unique: true, required: true },
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String, unique: true },
    email: { type: String, },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
      required: true,
    },
    teams: { type: [teamSchema], default: [] },
    direct_messages: { type: [String], default: [] },
    conversations: { type: [String], default: [] },
  },
  {
    collection: 'Users',
  }
);

export { userSchema };
export const User = mongoose.model<IUser>('User', userSchema);
