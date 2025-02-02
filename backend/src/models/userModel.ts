import mongoose, { Schema } from 'mongoose';
import { ITeam, teamSchema } from './teamsModel';

 interface IUser  {
  user_id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  role: 'admin' | 'user';
  teams?: ITeam[];
}

// User Schema
const userSchema: Schema = new Schema(
  {
    user_id: { type: String, unique: true, required: true },
    firstName: { type: String},
    lastName: { type: String},
    username: { type: String},
    email: { type: String, unique: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user', required: true },
    teams: { type: [teamSchema], default: [] },
  },
  {
    collection: 'Users',
  }
);

export { IUser, userSchema };
export const User = mongoose.model<IUser>('User', userSchema);
