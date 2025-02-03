/* Create team Pop Up */

import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-team-dialog',
  templateUrl: './add-team-dialog.component.html',
  styleUrls: ['./add-team-dialog.component.css'],
  standalone: true,
  imports: [MatDialogModule, MatInputModule, FormsModule, MatButtonModule, HttpClientModule],
})
export class AddTeamDialogComponent {
  searchQuery = ''; // input from 'input matInput' is stored in searchQuery
  teamName = '';
  description = '';

  constructor(private http: HttpClient, private dialogRef: MatDialogRef<AddTeamDialogComponent>) {}

  search() {
    // when the button is clicked, the search function is called
    console.log('searching for:', this.searchQuery);
  }

  createTeam() {
    const teamData = {
      user_id: 'exampleUserId', // Replace with actual user ID
      username: 'exampleUsername', // Replace with actual username
      team_name: this.teamName,
      description: this.description,
      members: [],
      role: 'admin'
    };

    this.http.post('/api/teams', teamData).subscribe(
      response => {
        console.log('Team created successfully:', response);
        this.dialogRef.close(); // Close the dialog
      },
      error => {
        console.error('Error creating team:', error);
      }
    );
  }
}
