import mongoose, { Schema } from 'mongoose';
import { IMessage } from '../../../shared/interfaces';

// Schema for message
const messageSchema = new Schema(
  {
    messageId: { type: String, unique: true },
    quotedMessageId: { type: String, required: false },
    content: { type: String, required: true },
    sender: { type: String, required: true }, // userId
    time: { type: String, required: true },
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

export { messageSchema };
export const Messages = mongoose.model<IMessage>('Messages', messageSchema);
