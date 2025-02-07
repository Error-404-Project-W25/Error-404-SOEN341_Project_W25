import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  RegistrationData,
  UserSignInData,
} from '../../../shared/user-credentials.types';
import { UserAuthResponse } from '../types/http-response.types';
import { IChannel, IUser, ITeam } from '../../../shared/interfaces';

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
    console.log(registrationData);
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

  // TODO: using POST for now (easier), might be worth changing to GET
  async getUserInfo(user_id: string): Promise<IUser | undefined> {
    try {
      const response: IUser = await firstValueFrom(
        this.http.post<IUser>(`${this.backendURL}/auth/getUserInfo`, {
          user_id,
        })
      );

      return response;
    } catch (error) {
      console.error('Error getting user info:', error);
    }

    return undefined;
  }
  async searchUsers(query: string): Promise<IUser[]> {
    try {
      const response: IUser[] = await firstValueFrom(
        this.http.get<IUser[]>(`${this.backendURL}/users/search`, {
          params: { q: query }, // Send query parameter
        })
      );
      return response;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  //////////////////////////// TEAMS ////////////////////////////

  async createTeams(
    user_id: string,
    username: string,
    team_name: string,
    description: string,
    members: string[],
    role: string
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(`${this.backendURL}/teams/create`, {
          user_id,
          username,
          team_name,
          description,
          members,
          role,
        })
      );
    } catch (error) {
      console.error('Error creating teams:', error);
    }
  }

  async getTeamById(team_id: string): Promise<ITeam | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<ITeam>(`${this.backendURL}/teams/getTeamById/${team_id}`)
      );
      return response;
    } catch (error) {
      console.error('Error getting team by id:', error);
      return null;
    }
  }

  async addMemberToTeam(
    user_id: string,
    username: string,
    team_id: string,
    role: string
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(`${this.backendURL}/teams/addMember`, {
          user_id,
          username,
          team_id,
          role,
        })
      );
    } catch (error) {
      console.error('Error adding member to team:', error);
    }
  }

  async getAllTeams(): Promise<void> {
    try {
      await firstValueFrom(this.http.get<void>(`${this.backendURL}/teams/`));
    } catch (error) {
      console.error('Error getting all teams:', error);
    }
  }

  //////////////////////////// CHANNELS ////////////////////////////

  async createChannel(
    team_id: string,
    channelName: string,
    channelDescription: string,
    creator_id: string,
    members: string[]
  ): Promise<string | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.post<{
          channel_id?: string;
          message?: string;
          error?: string;
          details?: string;
        }>(`${this.backendURL}/channels/create`, {
          team_id,
          channelName,
          channelDescription,
          creator_id,
          members
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
        this.http.post<{ message?: string; error?: string }>(
          `${this.backendURL}/channels/addUser`,
          {
            team_id,
            channel_id,
            user_id,
          }
        )
      );

      if (response) {
        if (response.message) {
          console.log(response.message);
          return true;
        } else {
          console.error(response.error);
        }
      } else {
        console.error('No response from backend');
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
        this.http.post<{ error?: string; channel?: IChannel }>(
          `${this.backendURL}/channels/getChannelById`,
          {
            team_id,
            channel_id,
          }
        )
      );

      if (response) {
        if (response.channel) {
          return response.channel;
        } else {
          console.error(response.error);
        }
      } else {
        console.error('No response from backend');
      }
    } catch (error) {
      console.error('Error getting channel by id:', error);
    }
    return undefined;
  }
}
