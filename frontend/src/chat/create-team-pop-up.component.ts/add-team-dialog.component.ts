/* Create Teams Pop-Up */

import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-team-dialog',
  template: `
    <h1 mat-dialog-title>Create Team</h1>
    <form class="custom-pop-up-centered">
      <mat-form-field>
        <mat-label>Team Name</mat-label>
        <input matInput [(ngModel)]="teamName" name="teamName">
      </mat-form-field>
    </form>
    <form class="custom-pop-up-centered">
      <mat-form-field>
        <mat-label>Description</mat-label>
        <input matInput [(ngModel)]="description" name="description">
      </mat-form-field>
    </form>
    <form class="custom-pop-up-centered">
      <mat-form-field>
        <mat-label>Search Members</mat-label>
        <input matInput placeholder="Search for something..." [(ngModel)]="searchQuery" name="searchQuery">
        <button mat-raised-button matSuffix (click)="search()" class="custom-dark-button-theme">Add
        </button>
      </mat-form-field>
    </form>
    <div mat-dialog-actions>
      <button mat-fab mat-dialog-close class="custom-dark-button-theme">Cancel</button>
      <button mat-fab class="custom-dark-button-theme" (click)="createTeams()">Finish</button>
    </div>
  `,
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
