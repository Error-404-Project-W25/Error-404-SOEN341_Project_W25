import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  RegistrationData,
  UserSignInData,
} from '../../../shared/user-credentials.types';
import { UserAuthResponse } from '../types/http-response.types';
import { IUser } from '../../../shared/interfaces';

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
          params: { q: query },
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
    members: IUser[],
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

  async getTeamById(team_id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(`${this.backendURL}/getTeamById`, {
          team_id,
        })
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
        this.http.post<void>(`${this.backendURL}/channels/create/${team_id}`, {
          channelName,
          channelDescription,
        })
      );
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  }

  async addUserToChannel(
    channel_id: string,
    user_id: string,
    team_id: string
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(
          `${this.backendURL}/channels/addUser/${channel_id}/${team_id}`,
          {
            user_id,
          }
        )
      );
    } catch (error) {
      console.error('Error adding user to channel:', error);
    }
  }
}
