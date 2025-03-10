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
import { IUser, IChannel } from '@shared/interfaces';
import { BackendService } from '@services/backend.service';
import { DataService } from '@services/data.service';

@Component({
  selector: 'app-add-member-team-pop-up',
  templateUrl: './add-member-team.dialogue.html',
  styleUrls: ['./add-member-team.dialogue.css'],
  standalone: true,
  imports: [
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    NgIf,
  ],
})
export class AddTeamMemberDialog {
  isDarkTheme: boolean = false;
  searchQuery = ''; // input from 'input matInput' is stored in searchQuery
  description = '';
  found = '';
  memberIdsToAdd: string[] = [];

  @Output() channelCreated = new EventEmitter<IChannel>();

  constructor(
    private dialogRef: MatDialogRef<AddTeamMemberDialog>,
    private backendService: BackendService,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA)
    public data: { selectedTeam: string; theme: boolean }
  ) {
    this.dataService.isDarkTheme.subscribe((isDarkTheme) => {
      this.isDarkTheme = isDarkTheme;
    });
  }

  // Search for members to add to the channel
  async search() {
    console.log('Searching for:', this.searchQuery);

    try {
      const user: IUser | undefined =
        await this.backendService.getUserByUsername(this.searchQuery);
      if (user) {
        console.log('User found:', user); // Debugging
        this.found = 'User found';
        this.memberIdsToAdd.push(user.userId);
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
