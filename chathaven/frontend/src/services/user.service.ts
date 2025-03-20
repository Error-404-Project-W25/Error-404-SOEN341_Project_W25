import { Injectable } from '@angular/core';
import { IUser } from '@shared/interfaces';
import { BehaviorSubject, Observable } from 'rxjs';
import { BackendService } from './backend.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userSubject = new BehaviorSubject<IUser | undefined>(undefined);
  user$: Observable<IUser | undefined> = this.userSubject.asObservable();
  
  private userStatusSubject = new BehaviorSubject<string>('online');
  userStatus$ = this.userStatusSubject.asObservable();

  constructor(private backendService: BackendService) {}

  async setUser(user: IUser) {
    const success = await this.backendService.updateStatus(user.userId, 'online');
    if (success) {
      user.status = 'online';
      this.userSubject.next(user);
      this.userStatusSubject.next('online');
    }
    localStorage.setItem('currentUserUID', user.userId);
  }

  getUser(): IUser | undefined {
    return this.userSubject.value;
  }

  async checkIfLoggedIn(): Promise<boolean> {
    const userId = localStorage.getItem('currentUserUID');
    if (!userId) return false;

    if (!this.getUser()) {
      const user = await this.backendService.getUserById(userId);
      if (!user) {
        localStorage.removeItem('currentUserUID');
        return false;
      }

      await this.setUser(user);
    }
    return true;
  }

  updateUser(user: IUser): void {
    // TODO: get rid of this
    this.userSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  async updateUserStatus(status: 'online' | 'away' | 'offline') {
    const currentUser = this.getUser();
    if (currentUser) {
      currentUser.status = status;
      this.userSubject.next(currentUser);
      this.userStatusSubject.next(status);
    }
  }

  async logout() {
    const currentUser = this.getUser();
    if (currentUser) {
      await this.backendService.updateStatus(currentUser.userId, 'offline');
      await this.updateUserStatus('offline');
    }
    
    this.userSubject.next(undefined);
    localStorage.clear();
    await this.backendService.logoutUser();
  }
}
