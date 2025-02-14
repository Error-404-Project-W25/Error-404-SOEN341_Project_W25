import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-edit-channel-pop-up',
  templateUrl: './edit-channel-pop-up.component.html',
 styleUrls: ['./../../components/chat/chat.component.css','./edit-channel-pop-up.component.css'],
  standalone: true,
  imports: [
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
  ],
})
export class EditChannelPopUpComponent {
  channelName = '';
  description = '';

  constructor(
    public dialogRef: MatDialogRef<EditChannelPopUpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Initialize the form with the existing channel data
    this.channelName = data.name;
    this.description = data.description;
  }

  updateChannel(): void {
    if (this.channelName && this.description) {
      this.dialogRef.close({
        name: this.channelName,
        description: this.description
      });
    }
  }

}