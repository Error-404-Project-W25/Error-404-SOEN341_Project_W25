import mongoose, { Schema } from 'mongoose';
import { IUser } from '../../../shared/interfaces';
import { inboxSchema } from './inboxModel';

// User Schema
const userSchema: Schema = new Schema(
  {
    userId: { type: String, unique: true, required: true },
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String, unique: true },
    email: { type: String },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
      required: true,
    },
    teams: { type: [String], default: [] }, // List of team IDs
    directMessages: { type: [String], default: [] },
    inbox: { type: [inboxSchema], default: [] }, // Set default to an empty object
    status: { type: String, default: "online" }, // online, offline, away
    lastSeen: { type: Date, default: Date.now },
  },
  {
    collection: 'Users',
  }
);

export { userSchema };
export const User = mongoose.model<IUser>('User', userSchema);
