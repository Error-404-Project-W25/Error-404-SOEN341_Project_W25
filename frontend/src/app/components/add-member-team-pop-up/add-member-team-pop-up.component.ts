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
  selector: 'app-add-member-team-pop-up',
  templateUrl: './add-member-team-pop-up.component.html',
  styleUrls: [
    '../chat/chat.component.css',
    './add-member-team-pop-up.component.css',
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
export class AddMemberTeamPopUpComponent {
  searchQuery = ''; // input from 'input matInput' is stored in searchQuery
  channelName = '';
  description = '';
  found = '';
  channelMembers: string[] = []; // stores selected members to be added
  selectedTeamId: string | null = null; // stores the selected team ID
  currentUser: IUser | undefined = undefined; // stores the current user

  @Output() channelCreated = new EventEmitter<IChannel>();

  constructor(
    private dialogRef: MatDialogRef<AddMemberTeamPopUpComponent>,
    private backendService: BackendService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: { selectedTeam: string | null }
  ) {
    this.currentUser = this.userService.getUser();
    this.selectedTeamId = data.selectedTeam;
  }
  teamMembers: string[] = [];

  // Search for members to add to the team
  search() {
    console.log('Searching for:', this.searchQuery);

    this.backendService
      .getUserByUsername(this.searchQuery)
      .then((user: IUser | undefined) => {
        if (user) {
          this.found = 'User found';
          console.log(this.found, user);

          this.teamMembers = [
            ...this.teamMembers,
            user.user_id,
          ].filter((id): id is string => id !== undefined);
          this.addMembersToTeam();
        } else {
          this.found = 'No user found';
          console.log(this.found);
        }

        setTimeout(() => {
          this.found = ' ';
        }, 2000);
      })
      .catch((error) => {
        console.error('Error searching users:', error);
      });
  }

  // Add selected members to the team
  async addMembersToTeam() {
    if (this.selectedTeamId) {
      for (const memberId of this.teamMembers) {
        const success = await this.backendService.addMemberToTeam(memberId, this.selectedTeamId);
        if (success) {
          console.log(`Member ${memberId} added to team ${this.selectedTeamId}`);
        } else {
          console.error(`Failed to add member ${memberId} to team ${this.selectedTeamId}`);
        }
      }
      this.dialogRef.close();
    }
  }
}
