export interface IChannel {
  channel_id: string;
  name: string;
  description: string;
  team_id: string;
  members: string[]; // user_id
}

export interface ITeam {
  team_id: string;
  team_name: string;
  description: string;
  admin: string[]; // user_id
  members: string[]; // user_id
  channels: IChannel[];
}

export interface IUser {
  user_id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  teams: ITeam[];
  direct_messages: string[];
  conversations: string[];
}
