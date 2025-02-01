import mongoose, { Schema } from 'mongoose';
import {IUser, userSchema} from './userModel';

interface IChannel {
    id?: string;
    name: string;
    description?: string;
    team_id?: string;
    members: IUser[];
  }

const channelSchema = new Schema({
    id: { type: String, unique: true },
    name: { type: String },
    description: { type: String },
    team: { type: String}, 
    members: { type: [userSchema], default: [] },
}, 
{ collection: 'Channels' }

);

export { IChannel, channelSchema };
export const Channel = mongoose.model<IChannel>('Channel', channelSchema);