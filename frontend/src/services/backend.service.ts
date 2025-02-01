import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  private backendURL: string = "http://localhost:3000/";

  constructor(private http: HttpClient) {}
  //////////////////////////// USERS ////////////////////////////

  //register user
  async registerUser(firstName: string, lastName: string, username: string, email: string, password: string, role: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(`${this.backendURL}/users/register`, {
          firstName,
          lastName,
          username,
          email,
          password,
          role,
        }),
      );
    } catch (error) {
      console.error('Error registering user:', error);
    }
  }

  //login user
  async loginUser(email: string, password: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(`${this.backendURL}/users/login`, {
          email,
          password,
        }),
      );
    } catch (error) {
      console.error('Error logging in user:', error);
    }
  }


  //logout user
  async logoutUser(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(`${this.backendURL}/users/logout`, {}),
      );
    } catch (error) {
      console.error('Error logging out user:', error);
    }
  }











  //////////////////////////// TEAMS ////////////////////////////

  //create teams 
  async createTeams(user_id: string, username: string, team_name: string, description: string, members: string[], role: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(`${this.backendURL}/teams/create`, {
          user_id,
          username,
          team_name,
          description,
          members,
          role,
        }),
      );
    } catch (error) {
      console.error('Error creating teams:', error);
    }
  }

  //get team by id
  async getTeamById(team_id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(`${this.backendURL}/getTeamById`, {
          team_id,
        }),
      );
    } catch (error) {
      console.error('Error getting team by id:', error);
    }
  }

 
  //add member to team
  async addMemberToTeam(user_id: string, username: string, team_id: string, role: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(`${this.backendURL}/teams/addMember`, {
          user_id,
          username,
          team_id,
          role,
        }),
      );
    } catch (error) {
      console.error('Error adding member to team:', error);
    }
  }
  
  //get all teams
  async getAllTeams(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.get<void>(`${this.backendURL}/teams/`),
      );
    } catch (error) {
      console.error('Error getting all teams:', error);
    }
  }




//////////////////////////// CHANNELS ////////////////////////////
//create channel
async createChannel(team_id: string, channelName: string, channelDescription: string): Promise<void> {
  try {
    await firstValueFrom(
      this.http.post<void>(`${this.backendURL}/channels/create/${team_id}`, {
        channelName,
        channelDescription,
      }),
    );
  } catch (error) {
    console.error('Error creating channel:', error);
  }



}

async addUserToChannel(channel_id: string, user_id: string, team_id: string): Promise<void> {
  try {
    await firstValueFrom(
      this.http.post<void>(`${this.backendURL}/channels/addUser/${channel_id}/${team_id}`, {
        user_id,
      }),
    );
  } catch (error) {
    console.error('Error adding user to channel:', error);
  }
}


}