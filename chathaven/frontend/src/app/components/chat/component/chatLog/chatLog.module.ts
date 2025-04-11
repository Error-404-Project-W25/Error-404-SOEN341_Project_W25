import { NgModule } from '@angular/core';

import { ChatLogComponent } from './chatLog.component';
import { DataService } from '../../../../../services/data.service'; // Import DataService
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { QuickMessagesComponent} from '../../dialogue/quick-messages/quick-messages.component';


@NgModule({
  imports: [
    PickerModule, // Import PickerModule
    ChatLogComponent, // Import ChatLogComponent
    QuickMessagesComponent, // Import QuickMessagesComponent
  ],
  // bootstrap: [ChatLogComponent],
  providers: [
    DataService, // Add DataService to providers
  ],
})
export class ChatModule {}
