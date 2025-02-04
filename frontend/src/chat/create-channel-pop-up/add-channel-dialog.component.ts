/* Create channel Pop Up */

import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BackendService } from '../../services/backend.service';
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
  members: { username: string; userID: string }[] = []; // stores selected members to be added

  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<AddChannelDialogComponent>,
    private backendService: BackendService,
    private userService: UserService
  ) {}

  // search for members to add to the channel
  search() {
    console.log('Searching for:', this.searchQuery);
    this.backendService
      .searchUsers(this.searchQuery) // searching for users with the search query
      .then((users: IUser[]) => {
        if (users.length > 0) {
          // filter out users with undefined usernames and map to the expected format
          this.members = users
            .filter((user) => user.username !== undefined)
            .map((user) => ({
              // mapping users to members
              username: user.username as string,
              userID: user.user_id,
            }));
          console.log('Users found and added to members:', this.members);
        } else {
          console.error('No users found');
        }
      })
      .catch((error) => {
        console.error('Error searching users:', error);
      });
  }

  // creating the channel
  async createChannel() {
    try {
      await this.backendService.createChannel(
        this.channelId,
        this.channelName,
        this.description
      );
      console.log('Channel created successfully');
      this.dialogRef.close(); // Close the dialog
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  }

  // add members to the channel
  async addMemberToChannel() {
    try {
      for (const member of this.members) {
        // loop through each member
        if (member) {
          // ddd each member to the channel
          await this.backendService.addUserToChannel(
            this.channelId,
            member.userID,
            this.channelId
          );
          console.log(
            `Member ${member.username} added to channel successfully`
          );
        }
      }
      this.dialogRef.close(); // close the dialog after all members are added
    } catch (error) {
      console.error('Error adding member to channel:', error);
    }
  }
}
