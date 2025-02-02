/* Create Teams Pop-Up */

import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-team-dialog',
  templateUrl: './add-team-dialog.component.html',
  styleUrls: ['../../app/app.component.css'],
  standalone: true,
  imports: [MatDialogModule, MatInputModule, FormsModule, MatButtonModule]
})
export class AddTeamDialogComponent {
  searchQuery = '';
  teamName = '';
  description = '';

  constructor(private http: HttpClient) {}

  search() {
    console.log('searching for:', this.searchQuery);
  }

  createTeams() {
    const teamData = {
      team_name: this.teamName,
      description: this.description,
      user_id: 'exampleUserId', // Replace with actual user ID
      username: 'exampleUsername', // Replace with actual username
      role: 'admin', // Replace with actual role
      members: [] // Add members if any
    };

    this.http.post('/api/teams', teamData).subscribe(
      response => {
        console.log('Team created successfully:', response);
      },
      error => {
        console.error('Failed to create team:', error);
      }
    );
  }
}
