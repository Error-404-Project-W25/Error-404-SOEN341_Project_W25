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
import { UserService } from '@services/user.service';
import { IUser, IChannel } from '@shared/interfaces';

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
  searchQuery = '';
  found = '';
  channelMembers: string[] = [];
  teamMembers: string[] = []; // To store current team members

  constructor(
    private dialogRef: MatDialogRef<AddMemberChannelPopUpComponent>,
    private backendService: BackendService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: { 
      channel_id: string,
      team_id: string 
    }
  ) {

    this.loadTeamMembers();

  }

  private async loadTeamMembers() {
    try {
      const team = await this.backendService.getTeamById(this.data.team_id);
      if (team) {
        this.teamMembers = team.members;
      }
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  }

  async search() {
    console.log('Searching for:', this.searchQuery);

    try {
      const user = await this.backendService.getUserByUsername(this.searchQuery);
      
      if (user) {
        // Check if user is a member of the team
        if (!this.teamMembers.includes(user.user_id)) {
          this.found = 'User must be a member of the team first';
          return;
        }

        // Check if user is already in the channel
        const isInChannel = await this.backendService.isUserInChannel(
          this.data.team_id,
          this.data.channel_id,
          user.user_id
        );

        if (isInChannel) {
          this.found = 'User is already in this channel';
          return;
        }

        this.found = 'User found';
        this.channelMembers = [...this.channelMembers, user.user_id];
      } else {
        this.found = 'No user found';
      }
    } catch (error) {
      console.error('Error searching user:', error);
      this.found = 'Error searching for user';
    }

    setTimeout(() => {
      this.found = '';
    }, 2000);
  }

  async addMembersToChannel() {
    try {
      for (const userId of this.channelMembers) {
        const success = await this.backendService.addUserToChannel(
          this.data.team_id,
          this.data.channel_id,
          userId
        );
  
        if (!success) {
          console.error(`Failed to add user ${userId} to channel`);
          return;
        }
      }
  
      this.dialogRef.close({ added: true, members: this.channelMembers });
    } catch (error) {
      console.error('Error adding members to channel:', error);
    }
  }
}
