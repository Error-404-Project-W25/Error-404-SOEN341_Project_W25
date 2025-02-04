/* Create team Pop Up */

import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import { BackendService } from '../../services/backend.service';

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

  constructor(
    private dialogRef: MatDialogRef<AddTeamDialogComponent>,
    private backendService: BackendService
  ) {}

  search() {
    // when the button is clicked, the search function is called
    console.log('searching for:', this.searchQuery);
    // this.backendService.searchUser(this.searchQuery).then(
    //   (response) => {
    //     console.log('User found:', response);
    //     // Add user to the team or perform any other action
    //   },
    //   (error) => {
    //     console.error('Error searching for user:', error);
    //   }
    // );
  }

  createTeam() {
    const teamData = {
      user_id: 'exampleUserId', // Replace with actual user ID
      username: 'exampleUsername', // Replace with actual username
      team_name: this.teamName,
      description: this.description,
      members: [],
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
