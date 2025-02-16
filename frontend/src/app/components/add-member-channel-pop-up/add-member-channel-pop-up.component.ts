import { Component, EventEmitter, Inject, Output } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { BackendService } from '@services/backend.service';
import { IUser, IChannel, ITeam } from '@shared/interfaces';

@Component({
  selector: 'app-add-member-channel-pop-up',
  standalone: true,
  imports: [
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    NgIf,
  ],
  templateUrl: './add-member-channel-pop-up.component.html',
  styleUrls: [
    '../chat/chat.component.css',
    './add-member-channel-pop-up.component.css',
  ],
})
export class AddMemberChannelPopUpComponent {
  isDarkTheme: boolean = false;
  searchQuery = '';
  found = '';
  memberIdsToAdd: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<AddMemberChannelPopUpComponent>,
    private backendService: BackendService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      channel_id: string;
      team_id: string;
      theme: boolean;
    }
  ) {
    this.isDarkTheme = data.theme;
  }

  async search() {
    console.log('Searching for:', this.searchQuery);

    try {
      const user: IUser | undefined =
        await this.backendService.getUserByUsername(this.searchQuery);

      if (!user) {
        this.found = 'No user found';
        return;
      }

      const currTeam: ITeam | undefined = await this.backendService.getTeamById(
        this.data.team_id
      );

      if (!currTeam?.members.includes(user?.user_id)) {
        this.found = 'User must be a member of the team first';
        return;
      }

      const targetChannel: IChannel | undefined =
        await this.backendService.getChannelById(
          this.data.team_id,
          this.data.channel_id
        );

      if (!targetChannel) {
        console.error('Channel not found');
        return;
      }

      const isUserInChannel: boolean = targetChannel.members.includes(
        user.user_id
      );

      if (isUserInChannel) {
        this.found = 'User is already in this channel';
        return;
      }

      this.found = 'User found';
      this.memberIdsToAdd.push(user.user_id);
    } catch (error) {
      console.error('Error searching user:', error);
      this.found = 'Error searching for user';
    }

    setTimeout(() => {
      this.found = '';
    }, 2000);
  }

  async addMembersToChannel() {
    for (const memberId of this.memberIdsToAdd) {
      try {
        const response: boolean = await this.backendService.addUserToChannel(
          this.data.team_id,
          this.data.channel_id,
          memberId
        );
        if (response) {
          console.log('Added member:', memberId);
        } else {
          console.error('Failed to add member:', memberId);
        }
      } catch (error) {
        console.error('Error adding member:', error);
      }
    }
    this.dialogRef.close();
  }
}
