/* Create team Pop Up */
import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BackendService } from '../../services/backend.service';
import { UserService } from '../../services/user.service';
import { IChannel, ITeam, IUser } from '../../../../shared/interfaces';

@Component({
  selector: 'app-add-team-dialog',
  templateUrl: './add-team-dialog.component.html',
  styleUrls: ['./../chat.component.css', './add-team-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    HttpClientModule,
  ],
})
export class AddTeamDialogComponent {
  @Output() teamCreated = new EventEmitter<void>();

  teamName = '';
  description = '';
  found = ' ';

  constructor(
    private dialogRef: MatDialogRef<AddTeamDialogComponent>,
    private backendService: BackendService,
    private userService: UserService
  ) {}

  createTeam() {}
}
