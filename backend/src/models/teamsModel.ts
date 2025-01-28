import mongoose, { Schema, Document } from 'mongoose';

// Define interfaces for nested objects
interface userInterface {
  user_id: string;
  username: string;
  role: string;
}

interface teamInterface extends Document {
  team_id: string;
  team_name: string;
  creator: userInterface;
  members: userInterface[];
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
  }
);

// Create the model based on the schema
export const Team = mongoose.model<teamInterface>('Team', teamSchema);
