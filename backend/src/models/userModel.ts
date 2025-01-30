import mongoose, { Schema, Document } from 'mongoose';

 interface IUser extends Document {
  user_id: string;
  username: string;
  email: string;
}

// User Schema
const userSchema = new Schema(
  {
    user_id: { type: String, unique: true, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: 'user' },
  },
  {
    collection: 'Users',
  }
);

export { IUser, userSchema };
export const User = mongoose.model<IUser>('User', userSchema);
