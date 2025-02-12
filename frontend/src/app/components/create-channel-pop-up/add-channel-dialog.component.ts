/**
 *  SAME IDEA AS THE CREATE TEAM POP UP
 * 
  GET MEMBERS ELSEWHERE, JUST CREATE THE CHANNEL WITH NAME AND DESCRIPTION
 * 

  SEPARATE BUTTON / COMPONENT TO ADD MEMBERS TO THE CHANNEL (same idea for teams)
 * 
 */

import { NgIf } from '@angular/common';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
import { IChannel, ITeam, IUser } from '@shared/interfaces';

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
  channelName = '';
  description = '';

  selectedTeamId: string | null = null; // stores the selected team ID

  @Output() channelCreated = new EventEmitter<IChannel>();

  constructor(
    private dialogRef: MatDialogRef<AddChannelDialogComponent>,
    private backendService: BackendService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: { selectedTeam: string | null }
  ) {
    this.selectedTeamId = data.selectedTeam;
  }

  // Creating the channel
  createChannel() {
    const currentUser: IUser | undefined = this.userService.getUser();

    if (!currentUser) {
      console.error('No signed in user');
      return;
    }

    if (!this.selectedTeamId) {
      console.error('No team selected');
      return;
    }

    this.backendService
      .createChannel(
        currentUser.user_id,
        this.selectedTeamId,
        this.channelName,
        this.description
      )
      .then((channel_id: string | undefined) => {
        if (!channel_id) {
          console.error('Error creating channel');
          return;
        }

        const newChannel: IChannel = {
          channel_id: channel_id,
          name: this.channelName,
          description: this.description,
          team_id: this.selectedTeamId!,
          members: [currentUser.user_id],
        };

        // Update current user's teams
        const currTeam: ITeam | undefined = currentUser.teams.find(
          (team) => team.team_id === this.selectedTeamId
        );

        // User should be in the team
        currTeam!.channels = currTeam!.channels
          ? [...currTeam!.channels, newChannel]
          : [newChannel];

        this.channelCreated.emit(newChannel);
        this.dialogRef.close();
      });

    console.log('Channel created successfully');
  }
}
