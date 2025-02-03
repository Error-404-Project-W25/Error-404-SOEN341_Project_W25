import mongoose, { Schema } from 'mongoose';
import { userSchema } from './userModel';
import { IChannel } from '../../../shared/interfaces';

const channelSchema = new Schema(
  {
    id: { type: String, unique: true },
    name: { type: String },
    description: { type: String },
    team: { type: String },
    members: { type: [userSchema], default: [] },
  },
  { collection: 'Channels' }
);

export { channelSchema };
export const Channel = mongoose.model<IChannel>('Channel', channelSchema);
