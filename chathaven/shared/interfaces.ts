export interface IChannel {
  channelId: string;
  name: string;
  description: string;
  teamId: string;
  members: string[]; // userId
  conversationId: string; // conversationId
}

export interface ITeam {
  teamId: string;
  teamName: string;
  description: string;
  admin: string[]; // userId
  members: string[]; // userId
  channels: string[]; // channelId
}

export interface IUser {
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  teams: string[]; // teamId
  directMessages: string[];
  inbox: IInbox[];
}

export interface IMessage {
  messageId: string;
  content: string;
  sender: string; // userId
  time: string;
}

export interface IConversation {
  conversationId: string;
  conversationName: string;
  messages: IMessage[];
}

export interface IInbox {
  inboxId: string;
  type: string;
  channelId: string;
  userIdThatYouWantToAdd: string;
}
