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

  constructor(private backendService: BackendService) {}

  setUser(user: IUser) {
    this.userSubject.next(user);
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
      this.setUser(user);
    }
    return true;
  }

  updateUser(user: IUser): void {
    // TODO: get rid of this
    this.userSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout() {
    this.userSubject.next(undefined);
    localStorage.clear();
    this.backendService.logoutUser();
  }
}
