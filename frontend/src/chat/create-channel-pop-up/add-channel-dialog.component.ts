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
import {NgIf} from '@angular/common';

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

  // // Creating the channel
  // createChannel() {
  //   const currentUser = this.userService.getUser();
  //   if (!currentUser?.username) {
  //     console.error('No user or username found');
  //     return;
  //   }

  //   // Add current user to channel members
  //   this.channelMembers = [
  //     ...this.channelMembers,
  //     ...(currentUser.user_id ? [currentUser.user_id] : []),
  //   ];
  //   console.log('Channel Members:', this.channelMembers);

  //   // Create channel data
  //   const channelData: IChannel = {
  //     name: this.channelName,
  //     description: this.description,
  //     members: this.channelMembers,
  //     team_id: this.selectedTeamId || '', // Ensure team_id is always a string
  //   };

  //   // REMOVE AFTER
  //   console.log('team id', channelData.team_id);
  //   console.log('channel name', channelData.name);
  //   console.log('channel description', channelData.description);


  //   if (this.selectedTeamId) {
  //     this.backendService
  //       .createChannel(this.selectedTeamId, this.channelName, this.description,this.currentUser?.user_id || '')
  //       .then((channel_id) => {
  //         if (channel_id) {
  //           const addUserPromises = this.channelMembers.map((memberId) =>
  //             this.backendService.addUserToChannel(
  //               this.selectedTeamId!,
  //               channel_id,
  //               memberId
  //             )
  //           );
  //           Promise.all(addUserPromises)
  //             .then(() => {
  //               console.log('Channel created successfully');
  //               console.log('Channel ID:', channel_id);
  //               console.log('Channel Members:', this.channelMembers);
  //               console.log('Users added to channel successfully');
  //               this.channelCreated.emit(); // Emit event when channel is created
  //               this.dialogRef.close(); // Close the dialog
  //             })
  //             .catch((error) => {
  //               console.error('Error adding users to channel:', error);
  //             });
  //         } else {
  //           console.error('Channel ID is undefined');
  //         }
  //         console.log('Channel created successfully');
  //         this.channelCreated.emit(); // Emit event when channel is created
  //         this.dialogRef.close(); // Close the dialog
  //       })
  //       .catch((error) => {
  //         console.error('Error creating channel:', error);
  //       });
  //   } else {
  //     console.error('Selected team ID is null');
  //   }

  // }
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

    // REMOVE AFTER
    console.log('team id', channelData.team_id);
    console.log('channel name', channelData.name);
    console.log('channel description', channelData.description);

    if (this.selectedTeamId) {
      try {
        const channel_id = await this.backendService.createChannel(
          this.selectedTeamId,
          this.channelName,
          this.description,
          currentUser.user_id
        );

        if (channel_id) {
          console.log('Channel created successfully with ID:', channel_id);

          // Add members to the channel
          for (const member_id of this.channelMembers) {
            const success = await this.backendService.addUserToChannel(
              this.selectedTeamId,
              channel_id,
              member_id
            );

            if (!success) {
              console.error(`Failed to add member ${member_id} to channel`);
            }
          }

          this.channelCreated.emit(); // Emit event when channel is created
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

