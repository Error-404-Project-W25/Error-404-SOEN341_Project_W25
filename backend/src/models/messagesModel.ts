import mongoose, { Schema } from 'mongoose';
import { userSchema } from './userModel';
import { IMessage } from '../../../shared/interfaces';

// Schema for channel
const messageSchema = new Schema(
  {
    message_id: { type: String, unique: true },
    content : { type: String, required: true },
    sender: { type: [userSchema] },
    time : { type: String, required: true },
  },
  {
    timestamps: false,
    collection: 'Messages',
  }
);

// Remove _id and __v before sending response to the client
messageSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export { channelSchema };
export const Channel = mongoose.model<IChannel>('Channel', channelSchema);