import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component'; // Import AppComponent
import { DataService } from '../services/data.service'; // Import DataService
import { ChatComponent } from './components/chat/chat.component'; // Import ChatComponent

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    AppComponent, // Import AppComponent
    ChatComponent, // Import ChatComponent
  ],
  providers: [
    DataService, // Add DataService to providers
  ],
})
export class AppModule {}
