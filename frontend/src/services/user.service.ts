/**
 * Storage of signed in IUser
 */
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

  constructor(private backendService: BackendService) {
    const storedUid: string | null = localStorage.getItem('currentUserUID');
    if (storedUid) {
      this.loadUser(storedUid);
    }
  }

  setUser(user: IUser) {
    this.userSubject.next(user);
    localStorage.setItem('currentUserUID', user.user_id);
  }

  getUser(): IUser | undefined {
    return this.userSubject.value;
  }

  async loadUser(userId: string) {
    const user: IUser | undefined = await this.backendService.getUserById(
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

  updateUser(user: IUser): void {
    this.userSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }
}
