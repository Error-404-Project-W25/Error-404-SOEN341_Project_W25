import mongoose, { Schema } from 'mongoose';
//import { IInbox } from '../../../shared/interfaces';

// Inbox Schema
const inboxSchema: Schema = new Schema(
  {
    inboxId: { type: String, unique: true, required: true },
    type: { type: String, required: true },
    channelId: { type: String, required: true },
    userThatYouWantToAdd: { type: String, required: true }
  }
);

export { inboxSchema };
