import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { IUser } from '@shared/interfaces';
import { BackendService } from '@services/backend.service';
import { DataService } from '@services/data.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-add-team-dialog',
  templateUrl: './create-team.dialogue.html',
  styleUrls: [
    './../../../../../assets/theme.css',
    './create-team.dialogue.css',
  ],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
  ],
})
export class TeamCreationDialog {
  @Output() teamCreated = new EventEmitter<void>();
  isDarkTheme: boolean = false;
  teamName = '';
  description = '';
  found = ' ';

  constructor(
    private dialogRef: MatDialogRef<TeamCreationDialog>,
    private backendService: BackendService,
    private userService: UserService,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA)
    public data: { selectedTeam: string | null; theme: boolean }
  ) {
    this.dataService.isDarkTheme.subscribe((isDarkTheme) => {
      this.isDarkTheme = isDarkTheme;
    });
  }

  async createTeam() {
    const currentUser: IUser | undefined = this.userService.getUser();

    if (!currentUser) {
      console.error('No signed in user');
      return;
    }

    try {
      const teamId: string | undefined = await this.backendService.createTeam(
        currentUser.user_id,
        this.teamName,
        this.description
      );

      if (!teamId) {
        console.error('Error creating team');
        return;
      }

      // Ensure the teams property is initialized
      if (!currentUser.teams) {
        currentUser.teams = [];
      }

      // Add the new team to the user's list of teams
      currentUser.teams.push(teamId);

      this.dialogRef.close({ team_id: teamId });
      console.log('Team created successfully');
    } catch (error) {
      console.error('Error creating team:', error);
    }
  }
}
