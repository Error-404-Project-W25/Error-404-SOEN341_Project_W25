import mongoose, { Schema, model, Document } from 'mongoose';

// Define interfaces for nested objects
interface IUser {
  user_id: string;
  username: string;
  role: string;
}

interface ITeam extends Document {
  team_id: string;
  team_name: string;
  creator: IUser;  // Change this to IUser instead of MongoCursorInUseError
  members: IUser[];
  created_at: Date;
}

// Schema for user
const userSchema: Schema = new Schema({
  user_id: { type: String, required: true },
  username: { type: String, required: true },
  role: { type: String, required: true }, // either admin or member
});

const teamSchema: Schema = new Schema(
  {
    team_id: { type: String, required: true, unique: true },
    team_name: { type: String, required: true },
    creator: { type: userSchema, required: true }, 
    members: { type: [userSchema], default: [] }, 
    created_at: { type: Date, default: Date.now }, 
  },
  {
    timestamps: false, // Disable Mongoose timestamps, seems like it creates one on its own
    collection: 'Teams' 
  },
);

// Create the model "Team" based on the "teamSchema"
export const Team = mongoose.model('Team', teamSchema);
