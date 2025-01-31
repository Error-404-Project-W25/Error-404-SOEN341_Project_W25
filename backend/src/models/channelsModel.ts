import mongoose, { Schema, Document } from 'mongoose';
import {IUser, userSchema} from './userModel';
import { v4 as uuidv4 } from 'uuid';

interface IChannel {
    id: string;
    name: string;
    description: string;
    team_id: string;
    members: IUser[];
  }

const channelSchema = new Schema({
    id: { type: String, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    team: { type: String, required: true}, 
    members: { type: [userSchema], default: [] },
});

export { IChannel, channelSchema };
export const Channel = mongoose.model<IChannel>('Channel', channelSchema);