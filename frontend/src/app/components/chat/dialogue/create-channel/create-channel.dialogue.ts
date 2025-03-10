import { NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { IChannel, IUser } from '@shared/interfaces';
import { BackendService } from '@services/backend.service';
import { DataService } from '@services/data.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-add-channel-dialog',
  templateUrl: './create-channel.dialogue.html',
  styleUrls: [
    './../../../../../assets/theme.css',
    './create-channel.dialogue.css',
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
export class ChannelCreationDialog {
  isDarkTheme: boolean = false;
  searchQuery = ''; // input from 'input matInput' is stored in searchQuery
  channelName = '';
  description = '';
  found = '';
  selectedTeamId: string | null = null; // stores the selected team ID

  constructor(
    private dialogRef: MatDialogRef<ChannelCreationDialog>,
    private backendService: BackendService,
    private userService: UserService,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA)
    public data: { selectedTeam: string | null; theme: boolean }
  ) {
    this.selectedTeamId = data.selectedTeam;
    this.dataService.isDarkTheme.subscribe((isDarkTheme) => {
      this.isDarkTheme = isDarkTheme;
    });
  }

  // Creating the channel
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
      currentUser.teams.forEach(async (teamId) => {
        const team = await this.backendService.getTeamById(teamId);
        if (team && teamId === this.selectedTeamId) {
          team.channels.push(newChannel.channel_id);
        }
      });

      this.dialogRef.close({ channel_id: channelId });
    } catch (error) {
      console.error('Error creating channel', error);
    }
  }
}
