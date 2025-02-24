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
import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
import { ITeam, IUser } from '@shared/interfaces';

@Component({
  selector: 'app-add-team-dialog',
  templateUrl: './add-team-dialog.component.html',
  styleUrls: [
    './../../../../../assets/theme.css',
    './add-team-dialog.component.css',
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
export class AddTeamDialogComponent {
  @Output() teamCreated = new EventEmitter<void>();
  isDarkTheme: boolean = false;
  teamName = '';
  description = '';
  found = ' ';

  constructor(
    private dialogRef: MatDialogRef<AddTeamDialogComponent>,
    private backendService: BackendService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA)
    public data: { selectedTeam: string | null; theme: boolean }
  ) {
    this.isDarkTheme = data.theme;
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

      const newTeam: ITeam | undefined = await this.backendService.getTeamById(
        teamId
      );

      if (!newTeam) {
        console.error('Error getting team');
        return;
      }

      // Add the new team to the user's list of teams
      this.userService.getUser()?.teams.push(newTeam);

      this.dialogRef.close({ team_id: teamId });
      console.log('Team created successfully');
    } catch (error) {
      console.error('Error creating team:', error);
    }
  }
}
