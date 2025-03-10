import mongoose, { Schema } from 'mongoose';
import { ITeam } from '../../../shared/interfaces';

// Schema for team
const teamSchema = new Schema(
  {
    teamId: { type: String, unique: true },
    teamName: { type: String, required: true },
    description: { type: String },
    admin: { type: [String], required: true },
    members: { type: [String], default: [] },
    channels: { type: [String], required: true }, // List of channel IDs
    createdAt: { type: Date, default: Date.now },
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
