import mongoose, { Schema } from 'mongoose';
import { IInbox } from '../../../shared/interfaces';

// Inbox Schema
const inboxSchema: Schema = new Schema(
  {
    inboxId: { type: String, unique: true},
    type: { type: String}, // invite or request
    channelId: { type: String},
    userIdThatYouWantToAdd: { type: String }
  }
);
// Remove _id and __v before sending response to the client
inboxSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
export { inboxSchema };
export const Inbox = mongoose.model<IInbox>('Inbox', inboxSchema);
