export interface IChannel {
  id?: string;
  name: string;
  description?: string;
  team_id?: string;
  members: IUser[];
}

export interface ITeam {
  team_id: string;
  team_name: string;
  description: string;
  admin: IUser[];
  members: IUser[];
  channels: IChannel[];
  created_at: Date;
}

export interface IUser {
  user_id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  role: 'admin' | 'user';
  teams?: ITeam[];
}
