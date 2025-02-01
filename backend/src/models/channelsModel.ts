import mongoose, { Schema, Document } from 'mongoose';
import {IUser, userSchema} from '../models/userModel';

interface IChannel extends Document {
    channel_id: string;
    channel_name: string;
    channel_description: string;
    team_id: string; // team id that the channel is in
    members: String[]; // string of user ids
  }

const channelSchema = new Schema({
    channel_id: { type: String, unique: true },
    channel_name: { type: String, required: true },
    channel_description: { type: String, required: true },
    team_id: { type: String, required: true}, 
    members: { type: [String], required: true }
  },
  {
  collection: 'Channels',
  }
);

export { IChannel, channelSchema };
export const Channel = mongoose.model<IChannel>('Channel', channelSchema);