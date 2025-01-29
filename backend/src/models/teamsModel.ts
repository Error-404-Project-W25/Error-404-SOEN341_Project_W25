import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

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
  team_id: string; // Will be set manually
  team_name: string;
  creator: IUser;
  members: IUser[];
  channels: IChannel[];
  created_at: Date;
}

// Schema for user
const userSchema = new Schema({
  user_id: { type: String, required: true },
  username: { type: String, required: true },
  role: { type: String, required: true },
});

// Schema for channel
const channelSchema = new Schema({
  channel_name: { type: String, required: true },
  description: { type: String, required: true },
  members: { type: [userSchema], default: [] },
});

// Schema for team
const teamSchema = new Schema(
  {
    team_id: { type: String, unique: true },
    team_name: { type: String, required: true },
    creator: { type: userSchema, required: true },
    members: { type: [userSchema], default: [] },
    channels: {
      type: [channelSchema],
      default: [{ channel_name: "General", description: "This is the default channel", members: [] }],
    },
    created_at: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    collection: 'Teams',
  }
);

// Remove _id and __v before sending response to the client
teamSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.id;
    delete ret._id;     // Remove Mongoose's default _id field
    delete ret.__v;     // Remove version key __v
return ret;
  },
});

export const Team = mongoose.model<ITeam>('Team', teamSchema);
