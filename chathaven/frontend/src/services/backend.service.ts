import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  IChannel,
  ITeam,
  IUser,
  IMessage,
  IConversation,
} from '@shared/interfaces';
import {
  RegistrationData,
  UserAuthResponse,
  UserSignInData,
} from '@shared/user-auth.types';
import { firstValueFrom } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  private backendURL: string = 'http://localhost:3000';
  private socket: Socket;
  private messageCache = new Map<string, {
    messages: IMessage[];
    timestamp: number;
  }>();
  private CACHE_DURATION = 30000; // 30 seconds

  constructor(private http: HttpClient) {
    this.socket = io(this.backendURL);
  }

  //////////////////////////// USERS ////////////////////////////

  async registerUser(
    registrationData: RegistrationData
  ): Promise<UserAuthResponse | undefined> {
    try {
      const response: UserAuthResponse = await firstValueFrom(
        this.http.post<UserAuthResponse>(`${this.backendURL}/auth/register`, {
          registrationData, // <- wrap it properly
        })
      );
      return response;
    } catch (error) {
      console.error('Error registering user:', error);
    }
    return undefined;
  }

  async loginUser(
    signInData: UserSignInData
  ): Promise<UserAuthResponse | undefined> {
    try {
      const response: UserAuthResponse = await firstValueFrom(
        this.http.post<UserAuthResponse>(`${this.backendURL}/auth/login`, {
          signInData, // <- wrapping it like this sends { signInData: {...} }
        })
      );
      return response;
    } catch (error) {
      console.error('Error logging in user:', error);
    }
    return undefined;
  }

  async logoutUser(): Promise<UserAuthResponse | undefined> {
    try {
      const response: UserAuthResponse = await firstValueFrom(
        this.http.post<UserAuthResponse>(`${this.backendURL}/auth/logout`, {})
      );
      return response;
    } catch (error) {
      console.error('Error logging out user:', error);
    }
    return undefined;
  }

  async getUserById(userId: string): Promise<IUser | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ user?: IUser; error?: string }>(
          `${this.backendURL}/users/${userId}`
        )
      );

      if (response.user) {
        return response.user;
      } else if (response.error) {
        console.error(`Backend error: ${response.error}`);
      } else {
        console.error(`User with ID ${userId} not found`);
      }
    } catch (error) {
      console.error('Error getting user info:', error);
    }
    return undefined;
  }

  async getUserByUsername(username: string): Promise<IUser | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ users?: IUser[]; error?: string }>(
          `${this.backendURL}/users/search/${username}`
        )
      );

      // Should only return one user with the given username
      if (response && response.users && response.users.length > 0) {
        return response.users[0];
      } else if (response.error) {
        console.error(response.error);
      } else {
        console.error(`User with username ${username} not found`);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
    return undefined;
  }

  async updateStatus(userId: string, status: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; error?: string }>(
          `${this.backendURL}/users/status`,
          { userId, status }
        )
      );

      if (response.success) {
        return true;
      } else {
        console.error(response.error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
    return false;
  }

  //////////////////////////// TEAMS ////////////////////////////

  // Get all teams of which the user is a member
  async getUserTeams(userId: string): Promise<ITeam[] | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ teams?: ITeam[]; error?: string }>(
          `${this.backendURL}/teams/user/${userId}`
        )
      );

      if (response && response.teams && response.teams.length > 0) {
        return response.teams;
      } else if (response.error) {
        console.error(response.error);
      } else {
        console.error(`No teams found for user with ID ${userId}`);
      }
    } catch (error) {
      console.error('Error getting teams for user:', error);
    }
    return undefined;
  }

  async getTeamById(teamId: string): Promise<ITeam | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ team?: ITeam; error?: string }>(
          `${this.backendURL}/teams/getTeamById/${teamId}`
        )
      );

      if (!response.error) {
        return response.team;
      }
      console.error(response.error);
    } catch (error) {
      console.error('Error getting team by id:', error);
    }
    return undefined;
  }

  async createTeam(
    userId: string,
    teamName: string,
    description: string
  ): Promise<string | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ teamId?: string; error?: string; details?: string }>(
          `${this.backendURL}/teams/create`,
          {
            userId,
            teamName,
            description,
          }
        )
      );

      if (response && response.teamId) {
        return response.teamId;
      } else {
        console.error(response.error);
        console.error(response.details);
      }
    } catch (error) {
      console.error('Error creating teams:', error);
    }
    return undefined;
  }

  async addMemberToTeam(memberId: string, teamId: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; error?: string; details?: string }>(
          `${this.backendURL}/teams/addMember`,
          {
            memberId,
            teamId,
          }
        )
      );

      if (response.success) {
        return true;
      } else {
        console.error(response.error);
        console.error(response.details);
      }
    } catch (error) {
      console.error('Error adding member to team:', error);
    }
    return false;
  }

  //////////////////////////// CHANNELS ////////////////////////////

  async createChannel(
    creatorId: string,
    teamId: string,
    channelName: string,
    channelDescription: string
  ): Promise<string | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.post<{
          channelId?: string;
          message?: string;
          error?: string;
          details?: string;
        }>(`${this.backendURL}/channels/create`, {
          creatorId,
          teamId,
          channelName,
          channelDescription,
        })
      );

      if (response) {
        if (response.error) {
          console.error(response.error);
          console.error(response.details);
        } else if (response.channelId) {
          return response.channelId;
        }
      } else {
        console.error('No response from backend');
      }
    } catch (error) {
      console.error('Error creating channel:', error);
    }
    return undefined;
  }

  // Returns true on success, false on failure
  async addUserToChannel(
    teamId: string,
    channelId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: string; error?: string; details?: string }>(
          `${this.backendURL}/channels/addUser`,
          {
            teamId,
            channelId,
            userId,
          }
        )
      );

      if (response.success) {
        return true;
      } else {
        console.error(response.error);
        console.error(response.details);
      }
    } catch (error) {
      console.error('Error adding user to channel:', error);
    }
    return false;
  }

  async getChannelById(channelId: string): Promise<IChannel | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.post<{
          channel?: IChannel;
          error?: string;
          details?: string;
        }>(`${this.backendURL}/channels/getChannelById`, {
          channelId,
        })
      );

      if (response && response.channel) {
        return response.channel;
      } else {
        console.error(response.error);
        console.error(response.details);
      }
    } catch (error) {
      console.error('Error getting channel by id:', error);
    }
    return undefined;
  }

  async removeMemberFromChannel(
    channelId: string,
    memberId: string
  ): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; error?: string; details?: string }>(
          `${this.backendURL}/channels/removeMember`,
          { channelId, memberId }
        )
      );

      if (response.success) {
        return true;
      } else {
        console.error('An error occurred:', response.error);
        console.error('Details:', response.details);
      }
    } catch (error) {
      console.error('Error removing member from channel:', error);
    }
    return false;
  }

  async deleteChannel(channelId: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.delete<{
          success: boolean;
          error?: string;
          details?: string;
        }>(`${this.backendURL}/channels/delete/${channelId}`)
      );

      if (response.success) {
        return true;
      } else {
        console.error('An error occurred:', response.error);
        console.error('Details:', response.details);
      }
    } catch (error) {
      console.error('Error deleting channel:', error);
    }
    return false;
  }

  //////////////////////////// MESSAGES ////////////////////////////

  async sendMessage(
    content: string,
    senderId: string,
    conversationId: string,
    quotedMessageId?: string
  ): Promise<boolean> {
    try {
      const payload = {
        content,
        senderId,
        conversationId,
        quotedMessageId: quotedMessageId || '',
      };

      const response = await firstValueFrom(
        this.http.post<{ success: boolean; error?: string }>(
          `${this.backendURL}/messages/send`,
          payload
        )
      );

      if (response.success) {
        return true;
      } else {
        console.error('Server error:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  async deleteMessage(
    conversationId: string,
    messageId: string
  ): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; error?: string }>(
          `${this.backendURL}/messages/delete`,
          { conversationId, messageId }
        )
      );

      if (response.success) {
        return true;
      } else {
        console.error('Server error:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }

  async getMessages(conversationId: string): Promise<IMessage[] | undefined> {
    // Check cache first
    const cached = this.messageCache.get(conversationId);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached.messages;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<{ messages?: IMessage[]; error?: string }>(
          `${this.backendURL}/messages/get/${conversationId}`
        )
      );

      if (response.messages) {
        this.messageCache.set(conversationId, {
          messages: response.messages,
          timestamp: now,
        });
        return response.messages;
      }

      console.error(response.error);
      return undefined;
    } catch (error) {
      console.error(
        'Error getting messages for conversationId:',
        conversationId,
        error
      );
      return undefined;
    }
  }

  async searchDirectMessages(
    conversationId: string,
    searchQuery: string,
    filters?: {
      fromDate?: string;
      toDate?: string;
    }
  ): Promise<IMessage[]> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ messages?: IMessage[]; error?: string }>(
          `${this.backendURL}/messages/search/direct`,
          {
            conversationId,
            searchQuery,
            filters,
          }
        )
      );

      if (response.messages) {
        return response.messages;
      } else {
        console.error('Search error:', response.error);
        return [];
      }
    } catch (error) {
      console.error('Error searching direct messages:', error);
      return [];
    }
  }

  async searchChannelMessages(
    channelId: string,
    searchQuery: string,
    filters?: {
      fromDate?: string;
      toDate?: string;
      duringDate?: string;
      username?: string;
    }
  ): Promise<IMessage[]> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ messages?: IMessage[]; error?: string }>(
          `${this.backendURL}/messages/search/channel`,
          {
            channelId,
            searchQuery,
            filters,
          }
        )
      );

      if (response.messages) {
        return response.messages;
      } else {
        console.error('Search error:', response.error);
        return [];
      }
    } catch (error) {
      console.error('Error searching channel messages:', error);
      return [];
    }
  }

  ///////////// CONVERSATIONS ///

  async createDirectMessages(
    conversationName: string,
    creatorId: string,
    addedUserId: string
  ): Promise<IConversation | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ newConversation?: IConversation; error?: string }>(
          `${this.backendURL}/conversations/createDirectMessages`,
          {
            conversationName,
            creatorId,
            addedUserId,
          }
        )
      );

      if (response.newConversation) {
        return response.newConversation;
      } else {
        console.error(response.error);
      }
    } catch (error) {
      console.error('Error creating direct messages:', error);
    }
    return undefined;
  }

  async getConversationById(
    conversationId: string
  ): Promise<IConversation | undefined> {
    if (!conversationId) {
      console.error('Invalid conversationId:', conversationId);
      return undefined;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<{ conversation?: IConversation; error?: string }>(
          `${this.backendURL}/conversations/${conversationId}`
        )
      );

      if (response.conversation) {
        return response.conversation;
      } else {
        console.error(response.error);
      }
    } catch (error) {
      console.error('Error getting conversation by id:', error);
    }
    return undefined;
  }

  ////////////////////// INBOX //////////////////////
  async response(
    userIdInboxBelongsTo: string,
    inboxId: string,
    decision: string // accept or decline
  ): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; error?: string }>(
          `${this.backendURL}/inbox/response`,
          { userIdInboxBelongsTo, inboxId, decision }
        )
      );

      if (response.success) {
        return true;
      } else {
        console.error('Server error:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Error responding to inbox entry:', error);
      return false;
    }
  }

  async requestToJoin(
    type: string,
    userIdThatYouWantToAdd: string,
    channelId: string
  ): Promise<string | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.post<{
          message?: string;
          inboxId?: string;
          error?: string;
          details?: string;
        }>(`${this.backendURL}/inbox/request`, {
          type,
          userIdThatYouWantToAdd,
          channelId,
        })
      );

      if (response.inboxId) {
        return response.inboxId;
      } else {
        console.error('Server error:', response.error);
        console.error('Server error details:', response.details);
        return undefined;
      }
    } catch (error) {
      console.error('Error requesting to join:', error);
      return undefined;
    }
  }

  async getLastSeenString(userId: string): Promise<string | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ lastSeen?: string; error?: string }>(
          `${this.backendURL}/users/lastSeen`,
          { userId }
        )
      );

      if (response.lastSeen) {
        return response.lastSeen;
      } else {
        console.error(response.error);
      }
    } catch (error) {
      console.error('Error getting last seen string:', error);
    }
    return undefined;
  }

  ////////////////////// CHATBOT //////////////////////

  async promptChatbot(prompt: string): Promise<string | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ response?: string; error?: string }>(
          `${this.backendURL}/chatbot/prompt`,
          { prompt }
        )
      );

      if (response.response) {
        return response.response;
      } else {
        console.error(response.error);
      }
    } catch (error) {
      console.error('Error prompting chatbot:', error);
    }
    return undefined;
  }

  ////////////////////// GIPHY //////////////////////

  async getGifs(
    query: string
  ): Promise<{ url: string; title: string }[] | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.get<{
          gifs?: { url: string; title: string }[];
          error?: string;
        }>(`${this.backendURL}/gif/search/${query}`)
      );

      if (response.gifs) {
        return response.gifs;
      } else {
        console.error(response.error);
      }
    } catch (error) {
      console.error('Error fetching GIFs:', error);
    }
    return undefined;
  }

  ///////////// URL PREVIEW /////////////
  async getUrlPreview(url: string): Promise<any | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ title: string; description: string; image: string }>(
          `${this.backendURL}/url-preview/preview`,
          { url }
        )
      );
      return response;
    } catch (error) {
      console.error('Error fetching URL preview:', error);
      return undefined;
    }
  }
}
