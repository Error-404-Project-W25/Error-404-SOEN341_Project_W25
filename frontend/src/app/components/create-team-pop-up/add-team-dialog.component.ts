import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
import { ITeam, IUser } from '@shared/interfaces';

@Component({
  selector: 'app-add-team-dialog',
  templateUrl: './add-team-dialog.component.html',
  styleUrls: ['./../../components/chat/chat.component.css', './add-team-dialog.component.css'],
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
  teamName = '';
  description = '';
  found = ' ';

  constructor(
    private dialogRef: MatDialogRef<AddTeamDialogComponent>,
    private backendService: BackendService,
    private userService: UserService
  ) {}

  async createTeam() {
    const currentUser: IUser | undefined = this.userService.getUser();

    if (!currentUser) {
      console.error('No signed in user');
      return;
    }

    try {
      const teamId: string | undefined = await this.backendService.createTeam(currentUser.user_id, this.teamName, this.description);

      if (!teamId) {
        console.error('Error creating team');
        return;
      }

      const newTeam: ITeam | undefined = await this.backendService.getTeamById(teamId);

      if (!newTeam) {
        console.error('Error getting team');
        return;
      }

      // Add the new team to the user's list of teams
      this.userService.getUser()?.teams.push(newTeam);

      this.dialogRef.close();
      console.log('Team created successfully');
    } catch (error) {
      console.error('Error creating team:', error);
    }
  }
}
