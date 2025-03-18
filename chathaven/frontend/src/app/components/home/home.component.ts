import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent {
  constructor(private router: Router, private userService: UserService) {}

  // On load / reload, check if user is logged in and go to chat if necessary
  ngOnInit() {
    this.userService.checkIfLoggedIn().then((isLoggedIn) => {
      if (isLoggedIn) {
        this.router.navigate(['/chat']);
      }
    });
  }

  // Navigate to the login page and open sign-up form (detect query parameters()
  goToLogin(showSignUp: boolean = false) {
    this.router.navigate(['/login'], { queryParams: { signup: showSignUp } });
  }
}
