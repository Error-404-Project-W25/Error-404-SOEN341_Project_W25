export interface IChannel {
  channel_id: string;
  name: string;
  description: string;
  team_id: string;
  members: string[]; // user_id
  conversationId: string; // conversation_id
}

export interface ITeam {
  team_id: string;
  team_name: string;
  description: string;
  admin: string[]; // user_id
  members: string[]; // user_id
  channels: string[]; // channel_id
}

export interface IUser {
  user_id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  teams: string[]; // team_id
  direct_messages: string[];
}

export interface IMessage {
  messageId: string;
  content: string; 
  sender: string; // user_id
  time: string; 
}

export interface IConversation {
  conversationId: string; 
  conversationName: string; 
  messages: IMessage[];
}