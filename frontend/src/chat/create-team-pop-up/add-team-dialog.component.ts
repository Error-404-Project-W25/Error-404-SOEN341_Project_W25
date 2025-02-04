/* Create team Pop Up */
import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import { BackendService } from '../../services/backend.service';
import { UserService } from '../../services/user.service';
import { IUser } from '../../../../shared/interfaces';

@Component({
  selector: 'app-add-team-dialog',
  templateUrl: './add-team-dialog.component.html',
  styleUrls: ['./add-team-dialog.component.css'],
  standalone: true,
  imports: [
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    HttpClientModule,
  ],
})
export class AddTeamDialogComponent {
  searchQuery = ''; // input from 'input matInput' is stored in searchQuery
  teamName = '';
  description = '';
  found = '';

  constructor(
    private dialogRef: MatDialogRef<AddTeamDialogComponent>,
    private backendService: BackendService,
    private userService: UserService
  ) {}

  teamMembers: IUser[] = [];

  search() {
    console.log('searching for:', this.searchQuery);
    this.backendService
      .searchUsers(this.searchQuery)
      .then((users: IUser[]) => {
        if (users.length > 0) {
          this.found = 'User found';
          setTimeout(() => {
            this.found = '';
          }, 2000);
        } else {
          this.found = 'No user found';
          setTimeout(() => {
            this.found = '';
          }, 2000);
        }
        this.teamMembers = users;
      })
      .catch((error) => {
        console.error('Error searching users:', error);
      });
  }

  createTeam() {
    const currentUser = this.userService.getUser();
    if (!currentUser) {
      console.error('No user found');
      return;
    }
    if (!currentUser.username) {
      console.error('No username found');
      return;
    }
    const teamData = {
      user_id: currentUser.user_id, // Replace with actual user ID
      username: currentUser.username, // Replace with actual username
      team_name: this.teamName,
      description: this.description,
      members: this.teamMembers,
      role: 'admin',
    };

    this.backendService
      .createTeams(
        teamData.user_id,
        teamData.username,
        teamData.team_name,
        teamData.description,
        teamData.members,
        teamData.role
      )
      .then(
        () => {
          console.log('Team created successfully');
          this.dialogRef.close(); // Close the dialog
        },
        (error) => {
          console.error('Error creating team:', error);
        }
      );
  }
}
