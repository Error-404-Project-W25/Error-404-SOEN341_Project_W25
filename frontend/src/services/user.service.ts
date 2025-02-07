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
  private userSubject = new BehaviorSubject<IUser | undefined>(undefined);
  user$: Observable<IUser | undefined> = this.userSubject.asObservable();

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
    this.teamsSubject.next(user.teams || []); // Store teams in observable
    localStorage.setItem('currentUserUID', user.user_id);
    this.updateUserTeams(user.user_id); 
  }

  async updateUserTeams(user_id: string) {
    const teams = await this.backendService.getAllTeamsForUser(user_id);
    this.teamsSubject.next(teams);  // Update observable teams list
  }

  getUser(): IUser | undefined {
    return this.userSubject.value;
  }

  async loadUser(userId: string) {
    const user: IUser | undefined = await this.backendService.getUserInfo(
      userId
    );

    if (user) {
      this.setUser(user);
    }
  }

  clearUser() {
    this.userSubject.next(undefined);
    localStorage.removeItem('currentUserUID');
  }

  addTeam(newTeam: ITeam) {
    const currentTeams = this.teamsSubject.value;
    this.teamsSubject.next([...currentTeams, newTeam]); // Update observable
  }

  refreshUserTeams() {
    const currentUser = this.getUser();
    if (currentUser) {
      this.backendService.getAllTeamsForUser(currentUser.user_id).then((teams) => {
        this.teamsSubject.next(teams);
      });
    }
  }
  
}
