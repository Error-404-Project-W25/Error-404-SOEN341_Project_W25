import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // Include RouterOutlet to enable routing
  template: '<router-outlet></router-outlet>', // Renders the routed component
})
export class AppComponent {
  title = 'ChatHaven';
}
