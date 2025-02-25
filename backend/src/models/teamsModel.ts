import mongoose, { Schema } from 'mongoose';
import { channelSchema } from './channelsModel';
import { ITeam } from '../../../shared/interfaces';

// Schema for team
const teamSchema = new Schema(
  {
    team_id: { type: String, unique: true },
    team_name: { type: String, required: true },
    description: { type: String },
    admin: { type: [String], required: true },
    members: { type: [String], default: [] },
    channels: { type: [channelSchema], required: true },
    created_at: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    collection: 'Teams',
  }
);

// Remove _id and __v before sending response to the client
teamSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export { teamSchema };
export const Team = mongoose.model<ITeam>('Team', teamSchema);