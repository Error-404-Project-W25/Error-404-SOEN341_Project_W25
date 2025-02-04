/* Create team Pop Up */
import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import { BackendService } from '../../services/backend.service';
import { UserService } from '../../services/user.service';
import { IChannel, ITeam, IUser } from '../../../../shared/interfaces';

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
  @Output() teamCreated = new EventEmitter<void>();
  searchQuery = ''; // input from 'input matInput' is stored in searchQuery
  teamName = '';
  description = '';
  found = '';

  constructor(
    private dialogRef: MatDialogRef<AddTeamDialogComponent>,
    private backendService: BackendService,
    private userService: UserService
  ) {}

  teamMembers: string[] = [];

  search() {
    console.log('searching for:', this.searchQuery);
    this.backendService
      .searchUsers(this.searchQuery)
      .then((users: IUser[]) => {
        if (users.length > 0) {
          this.found = 'User found';
          console.log('User found:', users);
          setTimeout(() => {
            this.found = '';
          }, 2000);
        } else {
          this.found = 'No user found';
          console.log('No user found:', users);
          setTimeout(() => {
            this.found = '';
          }, 2000);
        }
        this.teamMembers = [
          ...this.teamMembers,
          ...users
            .map((user) => user.user_id)
            .filter((user_id): user_id is string => user_id !== undefined),
        ];
      })
      .catch((error) => {
        console.error('Error searching users:', error);
      });
  }

  createTeam() {
    const currentUser = this.userService.getUser();
    /*add Admin*/
    this.teamMembers = [
      ...this.teamMembers,
      ...(currentUser?.user_id ? [currentUser.user_id] : []),
    ];
    console.log('Team Members:', this.teamMembers);
    if (!currentUser?.username) {
      console.error('No user or username found');
      return;
    }
    const teamData: ITeam = {
      // user_id: currentUser.user_id, // Replace with actual user ID
      // username: currentUser.username, // Replace with actual username
      team_name: this.teamName,
      description: this.description,
      members: this.teamMembers,
      admin: [currentUser], // Assuming admin is the current user
      channels: [], // Initialize channels as an empty array
    };

    this.backendService
      .createTeams(
        currentUser.user_id,
        currentUser.username,
        teamData.team_name,
        teamData.description || '',
        teamData.members,
        'admin' // or any appropriate role
      )
      .then(
        () => {
          console.log('Team created successfully');
          this.teamCreated.emit(); // Emit event when team is created
          this.dialogRef.close(); // Close the dialog
        },
        (error) => {
          console.error('Error creating team:', error);
        }
      );
    if (!currentUser.teams) {
      currentUser.teams = [];
    }
    currentUser.teams = [...currentUser.teams, teamData];
    console.log('Current User:', currentUser);
  }
}
