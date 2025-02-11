import { Component, EventEmitter, Output, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { BackendService } from '../../services/backend.service';
import { UserService } from '../../services/user.service';
import { IUser, IChannel } from '../../../../shared/interfaces';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-channel-setting-pop-up',
    templateUrl: './channel-setting-pop-up.component.html',
    styleUrls: ['./channel-setting-pop-up.css'],
  standalone: true,
  imports: [
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    NgIf,
  ],
})
export class EditChannelDialogComponent {
  searchQuery = ''; // input from 'input matInput' is stored in searchQuery
  channelName = '';
  description = '';
  found = '';
  channelMembers: string[] = []; // stores selected members to be added
  selectedTeamId: string | null = null; // stores the selected team ID
  currentUser: IUser | undefined = undefined; // stores the current user

  /*
  @Output() channelCreated = new EventEmitter<IChannel>();

  constructor(
    private dialogRef: MatDialogRef<EditChannelDialogComponent>,
    private backendService: BackendService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: { selectedTeam: string | null }
  ) {
    this.currentUser = this.userService.getUser();
    this.selectedTeamId = data.selectedTeam;
  }
*/
}
