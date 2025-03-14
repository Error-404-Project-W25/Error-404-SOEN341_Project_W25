import { NgModule } from '@angular/core';

import { ChatLogComponent } from './chatLog.component';
import { DataService } from '../../../../../services/data.service'; // Import DataService
import { PickerModule } from '@ctrl/ngx-emoji-mart';


@NgModule({
  imports: [
    PickerModule, // Import PickerModule
    ChatLogComponent, // Import ChatLogComponent
  ],
  // bootstrap: [ChatLogComponent],
  providers: [
    DataService, // Add DataService to providers
  ],
})
export class ChatModule {}
