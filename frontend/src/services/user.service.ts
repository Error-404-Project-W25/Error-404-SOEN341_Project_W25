/**
 * Storage of signed in user's data
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IUser, ITeam } from '../../../shared/interfaces';
import { BackendService } from './backend.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userSubject = new BehaviorSubject<IUser | null>(null);
  user$: Observable<IUser | null> = this.userSubject.asObservable();

  private teamsSubject = new BehaviorSubject<ITeam[]>([]);
  teams$ = this.teamsSubject.asObservable(); 

  constructor(private backendService: BackendService) {
    const storedUid: string | null = localStorage.getItem('currentUserUID');
    if (storedUid) {
      this.loadUser(storedUid);
    }
  }

  setUser(user: IUser) {
    this.userSubject.next(user);
    localStorage.setItem('currentUserUID', user.user_id);
    this.updateUserTeams(user.user_id); 
  }

  async updateUserTeams(user_id: string) {
    const teams = await this.backendService.getAllTeamsForUser(user_id);
    this.teamsSubject.next(teams);  // Update observable teams list
  }

  getUser(): IUser | null {
    return this.userSubject.value;
  }

  async loadUser(userId: string) {
    const user: IUser | null = await this.backendService.getUserInfo(userId);

    if (user) {
      this.setUser(user);
    }
  }

  clearUser() {
    this.userSubject.next(null);
    localStorage.removeItem('currentUserUID');
  }

  async refreshUserTeams() {
    if (this.userSubject.value) {
      const userId = this.userSubject.value.user_id;
      const teams = await this.backendService.getAllTeamsForUser(userId);
      const updatedUser = { ...this.userSubject.value, teams };
      this.userSubject.next(updatedUser);
    }
  }
  
}
