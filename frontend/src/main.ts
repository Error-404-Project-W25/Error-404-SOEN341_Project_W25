import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { AppModule } from './app/app.module'; // Import AppModule
import { DataService } from './services/data.service'; // Import DataService

bootstrapApplication(AppComponent, {
  providers: [
    { provide: AppModule, useClass: AppModule },
    provideRouter(routes),
    provideHttpClient(),
    DataService, // Add DataService to providers
  ],
}).catch((err) => console.error(err));

/*
bootstrapApplication(AppComponent, {
  providers: [{ provide: AppModule, useClass: AppModule }],
}).catch((err) => console.error(err));
*/
