import { kStringMaxLength } from 'buffer';
import mongoose, { Schema, model, Document } from 'mongoose';

// Define interfaces for nested objects
interface IUser {
  user_id: string;
  username: string;
  role: string;
}

interface IChannel {
  channel_name: string;
  description: string; 
  members: IUser[];
}

interface ITeam extends Document {
  team_id: string;
  team_name: string;
  creator: IUser;
  members: IUser[];
  channels: IChannel[];
  created_at: Date;
}

// Schema for user
const userSchema: Schema = new Schema({
  user_id: { type: String, required: true },
  username: { type: String, required: true },
  role: { type: String, required: true }, // either admin or member
});

// Schema for channel
const channelSchema: Schema = new Schema({
  channel_name: { type: String, required: true },
  description: {type: String, required: true},
  members: { type: [userSchema], default: [] }, // Default to an empty array

});

// Schema for team
const teamSchema: Schema = new Schema(
  {
    team_id: { type: String, required: true, unique: true },
    team_name: { type: String, required: true },
    creator: { type: userSchema, required: true },
    members: { type: [userSchema], default: [] },
    channels: { 
      type: [channelSchema], 
      default: [{ 
        channel_name: "General", 
        description: "This is the default channel", 
        members: [] }] }, // Default to "General" channel
    created_at: { type: Date, default: Date.now },
  },
  {
    timestamps: false, // Disable Mongoose timestamps
    collection: 'Teams',
  }
);

// Create the model "Team" based on the "teamSchema"
export const Team = mongoose.model<ITeam>('Team', teamSchema);
