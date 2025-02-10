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
import { BackendService } from '../../services/backend.service';
import { UserService } from '../../services/user.service';
import { IUser, IChannel } from '../../../../shared/interfaces';

@Component({
  selector: 'app-add-member-team-pop-up',
  templateUrl: './add-member-team-pop-up.component.html',
  styleUrls: ['./add-member-team-pop-up.component.css'],
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

  // Search for members to add to the channel
  search() {
    console.log('Searching for:', this.searchQuery);

    this.backendService
      .searchUsers(this.searchQuery)
      .then((users: IUser[]) => {
        this.found = users.length > 0 ? 'User found' : 'No user found';
        console.log(this.found, users);

        setTimeout(() => {
          this.found = ' ';
        }, 2000);

        this.teamMembers = [
          ...this.teamMembers,
          ...users
            .map((user) => user.user_id)
            .filter((id): id is string => id !== undefined),
        ];
      })
      .catch((error) => {
        console.error('Error searching users:', error);
      });
  }
}
