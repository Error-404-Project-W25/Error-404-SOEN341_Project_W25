import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  RegistrationData,
  UserSignInData,
} from '../../../shared/user-credentials.types';
import { UserAuthResponse } from '../types/http-response.types';
import { IUser, ITeam } from '../../../shared/interfaces';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  private backendURL: string = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  //////////////////////////// USERS ////////////////////////////

  async registerUser(
    registrationData: RegistrationData
  ): Promise<UserAuthResponse | null> {
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
    return null;
  }

  async loginUser(
    signInData: UserSignInData
  ): Promise<UserAuthResponse | null> {
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
    return null;
  }

  async logoutUser(): Promise<UserAuthResponse | null> {
    try {
      const response: UserAuthResponse = await firstValueFrom(
        this.http.post<UserAuthResponse>(`${this.backendURL}/auth/logout`, {})
      );
      return response;
    } catch (error) {
      console.error('Error logging out user:', error);
    }
    return null;
  }

  // TODO: using POST for now (easier), might be worth changing to GET
  async getUserInfo(user_id: string): Promise<IUser | null> {
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

    return null;
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

  async getAllTeamsForUser(user_id: string): Promise<ITeam[]> {
    try {
      return await firstValueFrom(
        this.http.get<ITeam[]>(`${this.backendURL}/teams/user/${user_id}`)
      );
    } catch (error) {
      console.error('Error getting teams for user:', error);
      return [];
    }
  }
  
  async createTeams(
    user_id: string,
    username: string,
    team_name: string,
    description: string,
    members: string[],
    role: string
  ): Promise<ITeam | null> {
    try {
      const response = await firstValueFrom(
        this.http.post<ITeam>(`${this.backendURL}/teams/create`, {
          user_id,
          username,
          team_name,
          description,
          members,
          role,
        })
      );
      return response;
    } catch (error) {
      console.error('Error creating teams:', error);
      return null;
    }
  }

  async getTeamById(team_id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.get<void>(`${this.backendURL}/teams/getTeamById/${team_id}`)
      );
    } catch (error) {
      console.error('Error getting team by id:', error);
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
    channelDescription: string
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(`${this.backendURL}/channels/${team_id}/create`, {
          channelName,
          channelDescription,
        })
      );
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  }

  async addUserToChannel(
    team_id: string,
    channel_id: string,
    user_id: string
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(
          `${this.backendURL}/channels/${team_id}/${channel_id}/addUser`,
          {
            user_id,
          }
        )
      );
    } catch (error) {
      console.error('Error adding user to channel:', error);
    }
  }


  async getChannelById(
    team_id: string,
    channel_id: string
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.http.get<void>(
          `${this.backendURL}/channels/${team_id}/${channel_id}`
        )
      );
    } catch (error) {
      console.error('Error getting channel by id:', error);
    }
  }
}

