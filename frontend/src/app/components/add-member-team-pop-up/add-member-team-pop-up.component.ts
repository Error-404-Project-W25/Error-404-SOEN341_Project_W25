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
  description = '';
  found = '';
  memberIdsToAdd: string[] = [];

  @Output() channelCreated = new EventEmitter<IChannel>();

  constructor(
    private dialogRef: MatDialogRef<AddMemberTeamPopUpComponent>,
    private backendService: BackendService,
    @Inject(MAT_DIALOG_DATA) public data: { selectedTeam: string }
  ) {}

  // Search for members to add to the channel
  async search() {
    console.log('Searching for:', this.searchQuery);

    try {
      const user: IUser | undefined =
        await this.backendService.getUserByUsername(this.searchQuery);
      if (user) {
        console.log('User found:', user); // Debugging
        this.found = 'User found';
        this.memberIdsToAdd.push(user.user_id);
      } else {
        this.found = 'No user found';
      }

      setTimeout(() => {
        this.found = '';
      }, 2000);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  }

  // Add members to the team
  async addMembers() {
    console.log('Adding members:', this.memberIdsToAdd);

    for (const memberId of this.memberIdsToAdd) {
      try {
        const response: boolean = await this.backendService.addMemberToTeam(
          memberId,
          this.data.selectedTeam
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
