import mongoose, { Schema } from 'mongoose';
import { IChannel } from '../../../shared/interfaces';

// Schema for channel
const channelSchema = new Schema(
  {
    id: { type: String, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    team: { type: String },
    members: { type: [String], default: [] },
  },
  {
    timestamps: false,
    collection: 'Channels',
  }
);

// Remove _id and __v before sending response to the client
channelSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret['id'];
    delete ret['_id'];
    delete ret['__v'];
    return ret;
  },
});

export { channelSchema };
export const Channel = mongoose.model<IChannel>('Channel', channelSchema);
