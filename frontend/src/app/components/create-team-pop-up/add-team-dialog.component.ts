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
  styleUrls: ['./add-team-dialog.component.css'],
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

  teamName = '';
  description = '';

  constructor(
    private dialogRef: MatDialogRef<AddTeamDialogComponent>,
    private backendService: BackendService,
    private userService: UserService
  ) {}

  createTeam() {
    const currentUser: IUser | undefined = this.userService.getUser();

    if (!currentUser) {
      console.error('No signed in user');
      return;
    }

    this.backendService
      .createTeam(currentUser.user_id, this.teamName, this.description)
      .then((teamId: string | undefined) => {
        if (!teamId) {
          console.error('Error creating team');
          return;
        }

        const newTeam: ITeam = {
          team_id: teamId,
          team_name: this.teamName,
          description: this.description,
          admin: [currentUser.user_id],
          members: [currentUser.user_id],
          channels: [],
        };

        currentUser.teams = currentUser.teams
          ? [...currentUser.teams, newTeam]
          : [newTeam];

        this.teamCreated.emit();
        this.dialogRef.close();
      });

    console.log('Team created successfully');
  }
}
