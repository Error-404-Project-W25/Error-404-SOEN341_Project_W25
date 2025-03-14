import { NgModule } from '@angular/core';
import { DataService } from '../../../services/data.service'; // Import DataService
import { PickerModule } from '@ctrl/ngx-emoji-mart';


@NgModule({
  declarations: [],
  imports: [
    PickerModule, // Import PickerModule
  ],
  providers: [
    DataService, // Add DataService to providers
  ],
})
export class ChatModule {}
