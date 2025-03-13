import mongoose, { Schema } from 'mongoose';
import { IInbox } from '../../../shared/interfaces';

// Inbox Schema
const inboxSchema: Schema = new Schema(
  {
    inboxId: { type: String, unique: true, required: true },
    type: { type: String, required: true }, // invite or request
    channelId: { type: String, required: true },
    userThatYouWantToAdd: { type: String, required: true }
  }
);

export { inboxSchema };
export const Inbox = mongoose.model<IInbox>('Inbox', inboxSchema);
