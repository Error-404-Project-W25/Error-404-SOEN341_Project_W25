import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IChannel, ITeam, IUser, IMessage, IConversation } from '@shared/interfaces';
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
          registrationData,
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
          signInData,
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

  async getUserById(user_id: string): Promise<IUser | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ user?: IUser; error?: string }>(
          `${this.backendURL}/users/${user_id}`
        )
      );

      if (response.user) {
        return response.user;
      } else if (response.error) {
        console.error(response.error);
      } else {
        console.error(`User with ID ${user_id} not found`);
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

  //////////////////////////// TEAMS ////////////////////////////

  // Get all teams of which the user is a member
  async getUserTeams(user_id: string): Promise<ITeam[] | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ teams?: ITeam[]; error?: string }>(
          `${this.backendURL}/teams/user/${user_id}`
        )
      );

      if (response && response.teams && response.teams.length > 0) {
        return response.teams;
      } else if (response.error) {
        console.error(response.error);
      } else {
        console.error(`No teams found for user with ID ${user_id}`);
      }
    } catch (error) {
      console.error('Error getting teams for user:', error);
    }
    return undefined;
  }

  async getTeamById(team_id: string): Promise<ITeam | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ team?: ITeam; error?: string }>(
          `${this.backendURL}/teams/getTeamById/${team_id}`
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
    user_id: string,
    team_name: string,
    description: string
  ): Promise<string | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ team_id?: string; error?: string; details?: string }>(
          `${this.backendURL}/teams/create`,
          {
            user_id,
            team_name,
            description,
          }
        )
      );

      if (response && response.team_id) {
        return response.team_id;
      } else {
        console.error(response.error);
        console.error(response.details);
      }
    } catch (error) {
      console.error('Error creating teams:', error);
    }
    return undefined;
  }

  async addMemberToTeam(member_id: string, team_id: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; error?: string; details?: string }>(
          `${this.backendURL}/teams/addMember`,
          {
            member_id,
            team_id,
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
    creator_id: string,
    team_id: string,
    channelName: string,
    channelDescription: string
  ): Promise<string | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.post<{
          channel_id?: string;
          message?: string;
          error?: string;
          details?: string;
        }>(`${this.backendURL}/channels/create`, {
          creator_id,
          team_id,
          channelName,
          channelDescription,
        })
      );

      if (response) {
        if (response.error) {
          console.error(response.error);
          console.error(response.details);
        } else if (response.channel_id) {
          console.log(response.message);
          return response.channel_id;
        }
      } else {
        console.error('No response from backend');
      }
    } catch (error) {
      console.error('Error creating channel:', error);
    }
    return undefined;
  }

  async addUserToChannel(
    team_id: string,
    channel_id: string,
    user_id: string
  ): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: string; error?: string; details?: string }>(
          `${this.backendURL}/channels/addUser`,
          {
            team_id,
            channel_id,
            user_id,
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

  async getChannelById(
    team_id: string,
    channel_id: string
  ): Promise<IChannel | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.post<{
          channel?: IChannel;
          error?: string;
          details?: string;
        }>(`${this.backendURL}/channels/getChannelById`, {
          team_id,
          channel_id,
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


//////////////////////////// MESSAGES ////////////////////////////

async sendMessage(
  content: string,
  conversationId: string,
  sender: string // user_id
): Promise<boolean> {
  try {
    const response = await firstValueFrom(
      this.http.post<{ success: boolean; error?: string }>(
        `${this.backendURL}/messages/send`,
        { content, sender, conversationId }
      )
    );

    if (response.success) {
      return true;
    } else {
      console.error(response.error);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
  return false;
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
  try {
    const response = await firstValueFrom(
      this.http.get<{ messages?: IMessage[]; error?: string }>(
        `${this.backendURL}/messages/get/${conversationId}`
      )
    );

    if (response.messages) {
      return response.messages;
    } else {
      console.error(response.error);
    }
  } catch (error) {
    console.error('Error getting messages:', error);
  }
  return undefined;
}

// async joinRoom(conversationId: string): Promise<void> {
//   this.socket.emit('joinRoom', { conversationId });
// }

///////////// CONVERSATIONS ///

async createConversation(
  conversationName: string, 
  creatorId: string, // userId of the one that created the DM
  addedUserId: string // userId of the one that was added to the DM
): Promise<string | undefined> {
  try {
    const response = await firstValueFrom(
      this.http.post<{ conversationId?: string; error?: string }>(
        `${this.backendURL}/conversations/create`,
        {
          conversationName,
          creatorId,
          addedUserId
        }
      )
    );

    if (response.conversationId) {
      return response.conversationId;
    } else {
      console.error(response.error);
    }
  } catch (error) {
    console.error('Error creating conversation:', error);
  }
  return undefined;


}


async getConversationById(
  conversationId: string
): Promise<IConversation | undefined> {
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

}
