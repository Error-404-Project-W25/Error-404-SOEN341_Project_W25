import { Component, EventEmitter, Output, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BackendService } from '../../services/backend.service';
import { UserService } from '../../services/user.service';
import { IUser, IChannel } from '../../../../shared/interfaces';
import { ChatComponent } from '../chat.component';

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
  channelName = '';
  description = '';
  found = '';
  channelMembers: string[] = []; // stores selected members to be added
  selectedTeamId: string | null = null; // stores the selected team ID
  currentUser: IUser | undefined = undefined; // stores the current user

  @Output() channelCreated = new EventEmitter<void>();

  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<AddChannelDialogComponent>,
    private backendService: BackendService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: { selectedTeam: string | null }
  ) {
    this.currentUser = this.userService.getUser();
    this.selectedTeamId = data.selectedTeam;
  }

  // Search for members to add to the channel
  search() {
    console.log('Searching for:', this.searchQuery);

    this.backendService
      .searchUsers(this.searchQuery)
      .then((users: IUser[]) => {
        this.found = users.length > 0 ? 'User found' : 'No user found';
        console.log(this.found, users);

        setTimeout(() => {
          this.found = '';
        }, 2000);

        this.channelMembers = [
          ...this.channelMembers,
          ...users
            .map((user) => user.user_id)
            .filter((id): id is string => id !== undefined),
        ];
      })
      .catch((error) => {
        console.error('Error searching users:', error);
      });
  }

  // Creating the channel
  createChannel() {
    const currentUser = this.userService.getUser();
    if (!currentUser?.username) {
      console.error('No user or username found');
      return;
    }

    // Add current user to channel members
    this.channelMembers = [
      ...this.channelMembers,
      ...(currentUser.user_id ? [currentUser.user_id] : []),
    ];
    console.log('Channel Members:', this.channelMembers);

    // Create channel data
    const channelData: IChannel = {
      name: this.channelName,
      description: this.description,
      members: this.channelMembers,
      team_id: this.selectedTeamId || '', // Ensure team_id is always a string
    };

    if (this.selectedTeamId) {
      this.backendService
        .createChannel(this.selectedTeamId, this.channelName, this.description)
        .then(() => {
          console.log('Channel created successfully');
          this.channelCreated.emit(); // Emit event when channel is created
          this.dialogRef.close(); // Close the dialog
        })
        .catch((error) => {
          console.error('Error creating channel:', error);
        });
    } else {
      console.error('Selected team ID is null');
    }
  }

  /*
  // add members to the channel
  async addMemberToChannel() {
    try {
      for (const member of this.members) {
        // loop through each member
        if (member) {
          // add each member to the channel
          await this.backendService.addUserToChannel(
            this.channelId,
            member.userID,
            this.channelId
          );
          console.log(
            member ${member.username} added to channel successfully
        );
        }
      }
      this.dialogRef.close(); // close the dialog after all members are added
    } catch (error) {
      console.error('Error adding member to channel:', error);
    }
  } */
}
