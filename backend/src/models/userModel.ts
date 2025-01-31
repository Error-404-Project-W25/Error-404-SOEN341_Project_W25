import mongoose, { Schema } from 'mongoose';

 interface IUser  {
  user_id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  role: 'admin' | 'user';
}

// User Schema
const userSchema = new Schema(
  {
    user_id: { type: String, unique: true, required: true },
    firstName: { type: String},
    lastName: { type: String},
    username: { type: String},
    email: { type: String, unique: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user', required: true },
  },
  {
    collection: 'Users',
  }
);

export { IUser, userSchema };
export const User = mongoose.model<IUser>('User', userSchema);
