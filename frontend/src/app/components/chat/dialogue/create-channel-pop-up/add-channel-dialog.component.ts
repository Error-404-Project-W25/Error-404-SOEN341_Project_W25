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
  styleUrls: [
    './../../../../../assets/theme.css',
    './add-channel-dialog.component.css',
  ],
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
  isDarkTheme: boolean = false;
  searchQuery = ''; // input from 'input matInput' is stored in searchQuery
  channelName = '';
  description = '';
  found = '';
  selectedTeamId: string | null = null; // stores the selected team ID

  constructor(
    private dialogRef: MatDialogRef<AddChannelDialogComponent>,
    private backendService: BackendService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA)
    public data: { selectedTeam: string | null; theme: boolean }
  ) {
    this.selectedTeamId = data.selectedTeam;
    this.isDarkTheme = data.theme;
  }

  // Creating the channel
  // TODO: refactor in style of add-team-dialog.component.ts
  async createChannel() {
    const currentUser: IUser | undefined = this.userService.getUser();

    if (!currentUser) {
      console.error('No signed in user');
      return;
    }

    if (!this.selectedTeamId) {
      console.error('No team selected');
      return;
    }

    try {
      const channelId: string | undefined =
        await this.backendService.createChannel(
          currentUser.user_id,
          this.selectedTeamId,
          this.channelName,
          this.description
        );

      if (!channelId) {
        console.error('Error creating channel');
        return;
      }

      const newChannel: IChannel | undefined =
        await this.backendService.getChannelById(
          this.selectedTeamId,
          channelId
        );

      if (!newChannel) {
        console.error('Error getting channel');
        return;
      }

      // Add the new channel to the current user's teams
      currentUser.teams.forEach((team) => {
        if (team.team_id === this.selectedTeamId) {
          team.channels.push(newChannel);
        }
      });

      this.dialogRef.close();
    } catch (error) {
      console.error('Error creating channel', error);
    }
  }
}
