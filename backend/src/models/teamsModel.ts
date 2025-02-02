import mongoose, { Schema } from 'mongoose';
import { IUser, userSchema } from './userModel'; 
import { IChannel, channelSchema } from './channelsModel'; 

interface ITeam  {
  team_id: string; 
  team_name: string;
  description: string; 
  admin: IUser[];
  members: IUser[];
  channels: IChannel[];
  created_at: Date;
}

// Schema for team
const teamSchema = new Schema(
  {
    team_id: { type: String, unique: true },
    team_name: { type: String, required: true },
    admin: { type: [userSchema], required: true },
    members: { type: [userSchema], default: [] },
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

export { ITeam, teamSchema };
export const Team = mongoose.model<ITeam>('Team', teamSchema);