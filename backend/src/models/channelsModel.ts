import mongoose, { Schema, Document } from 'mongoose';
import {IUser, userSchema} from './userModel';

interface IChannel {
    id?: string;
    name: string;
    description?: string;
    team_id: string;
    members: IUser[];
  }

const channelSchema = new Schema({
    id: { type: String, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    team: { type: String, required: true}, 
    members: { type: [userSchema], default: [] },
});

export { IChannel, channelSchema };
export const Channel = mongoose.model<IChannel>('Channel', channelSchema);