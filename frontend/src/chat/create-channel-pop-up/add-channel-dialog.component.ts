/* Create channel Pop Up */

import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BackendService} from '../../services/backend.service';
import { UserService } from '../../services/user.service';
import { IUser } from '../../../../shared/interfaces';

@Component({
  selector: 'app-add-channel-dialog',
  templateUrl: './add-channel-dialog.component.html',
  styleUrls: ['./add-channel-dialog.component.css'],
  standalone: true,
  imports: [
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    HttpClientModule,
  ],
})
export class AddChannelDialogComponent {
  searchQuery = ''; // input from 'input matInput' is stored in searchQuery
  channelId = '';
  channelName = '';
  description = '';
  members: { username: string }[] = []; // stores selected members to be added

  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<AddChannelDialogComponent>,
    private backendService: BackendService,
    private userService: UserService
  ) {}


 async createChannel() {

    try {
      await this.backendService.createChannel(this.channelId, this.channelName, this.description);
      console.log('Channel created successfully');
      this.dialogRef.close(); // Close the dialog
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  }
/*
  async addMemberToChannel() {
    try {
      const memberUsername = this.members[0].username;  // Assuming members array stores only usernames
      const member = await this.userService.getUser();  // Get the full user data using username

      if (member) {
        const memberId = member.user_id;  // Extract the user_id

        // Now that you have the user_id, you can add the member to the channel
        await this.backendService.addUserToChannel(this.channelId, memberId, this.channelId);
        console.log('Member added to channel successfully');
        this.dialogRef.close(); // Close the dialog
      } else {
        console.error('Member not found');
      }
    } catch (error) {
      console.error('Error adding member to channel:', error);
    }
  }
*/
}
