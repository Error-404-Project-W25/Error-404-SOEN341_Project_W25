import { Injectable } from '@angular/core';
import { CanActivateChild, Router } from '@angular/router';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivateChild {
  constructor(private userService: UserService, private router: Router) {
    console.log('AuthGuard instantiated'); // TODO: even this doesn't get noticed
  }

  canActivateChild(): boolean {
    console.log('checking'); // TODO: this isn't being reached
    if (this.userService.getUser()?.user_id) {
      return true;
    } else {
      // If no user is signed in, redirect to login
      this.router.navigate(['/']);
      return false;
    }
  }
}
