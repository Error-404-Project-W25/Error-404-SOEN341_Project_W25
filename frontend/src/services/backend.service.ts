import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IChannel, ITeam, IUser } from '@shared/interfaces';
import {
  RegistrationData,
  UserAuthResponse,
  UserSignInData,
} from '@shared/user-auth.types';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  private backendURL: string = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

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
  async getUserTeams(user_id: string): Promise<ITeam | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ teams?: ITeam[]; error?: string }>(
          `${this.backendURL}/teams/user/${user_id}`
        )
      );

      if (response && response.teams && response.teams.length > 0) {
        return response.teams[0];
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

      if (response && response.team) {
        return response.team;
      } else {
        console.error(response.error);
      }
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
        this.http.post<{ team_id: string; error?: string; details?: string }>(
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

  // Returns true on success, false on failure
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
}
