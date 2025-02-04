import { getUserInfo } from './../../../../backend/src/controllers/usersController';
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
  teamMembers: IUser[] = [];

  constructor(
    private dialogRef: MatDialogRef<AddTeamDialogComponent>,
    private backendService: BackendService,
    private userService: UserService
  ) {}

  search() {
  }

  

  createTeam() {
    const currentUser = this.userService.getUser();
    if (!currentUser) {
      console.error('No current user found');
      return;
    }

    if (!currentUser.username) {
      console.error('Current user does not have a username');
      return;
    }

    const teamData = {
      user_id: currentUser.user_id,
      username: currentUser.username,
      team_name: this.teamName,
      description: this.description,
      members: this.teamMembers,
      role: 'admin',
    };

    this.backendService.createTeams(
      teamData.user_id,
      teamData.username,
      teamData.team_name,
      teamData.description,
      teamData.members,
      teamData.role
    ).then(
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
