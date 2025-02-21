import mongoose, { Schema } from 'mongoose';
import { messageSchema } from './messagesModel';
import { IConversation } from '../../../shared/interfaces';

// Schema for conversation
const conversationSchema = new Schema(
  {
    conversationId: { type: String, unique: true },
    conversationName: { type: String, required: true },
    messages : { type: [messageSchema], default: [] },
  },
  {
    timestamps: false,
    collection: 'Conversations',
  }
);

// Remove _id and __v before sending response to the client
conversationSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export { conversationSchema };
export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);