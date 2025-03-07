import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent {
  constructor(private router: Router) {}

  // Navigate to the login page and open sign-up form (detect query parameters()
  goToLogin(showSignUp: boolean = false) {
    this.router.navigate(['/login'], { queryParams: { signup: showSignUp } });
  }
}
