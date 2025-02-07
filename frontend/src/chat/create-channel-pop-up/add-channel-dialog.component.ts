import { Component, EventEmitter, Output, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { BackendService } from '../../services/backend.service';
import { UserService } from '../../services/user.service';
import { IUser, IChannel } from '../../../../shared/interfaces';
import { NgIf } from '@angular/common';

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
    NgIf,
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

  @Output() channelCreated = new EventEmitter<IChannel>();

  constructor(
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
  async createChannel() {
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
      try {
        const channel_id: string | undefined =
          await this.backendService.createChannel(
            this.selectedTeamId,
            this.channelName,
            this.description,
            currentUser.user_id,
            this.channelMembers
          );

        if (channel_id) {
          console.log('Channel created successfully with ID:', channel_id);

          // // Add members to the channel
          // if (this.channelMembers.length > 0) {
          //   for (const member_id of this.channelMembers) {
          //     const success: boolean =
          //       await this.backendService.addUserToChannel(
          //         this.selectedTeamId,
          //         channel_id,
          //         member_id
          //       );

          //     if (!success) {
          //       console.error(`Failed to add member ${member_id} to channel`);
          //     }
          //   }
          // } else {
          //   console.log('No additional members to add to the channel');
          // }

          this.channelCreated.emit(channelData); // Emit event when channel is created
          this.dialogRef.close(); // Close the dialog
        } else {
          console.error('Failed to create channel');
        }
      } catch (error) {
        console.error('Error creating channel:', error);
      }
    } else {
      console.error('Selected team ID is null');
    }
  }
}
