import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component'; // Import AppComponent
import { DataService } from '../services/data.service'; // Import DataService
import { ChatComponent } from './components/chat/chat.component'; // Import ChatComponent
import { PickerModule } from '@ctrl/ngx-emoji-mart';


@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    AppComponent, // Import AppComponent
    ChatComponent, // Import ChatComponent
    PickerModule, // Import PickerModule
  ],
  providers: [
    DataService, // Add DataService to providers
  ],
})
export class AppModule {}
