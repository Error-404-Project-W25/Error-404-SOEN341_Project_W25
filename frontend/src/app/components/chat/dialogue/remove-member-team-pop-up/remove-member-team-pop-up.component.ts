import { Component, EventEmitter, Inject, Output } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { BackendService } from '@services/backend.service';
import { IUser, IChannel } from '@shared/interfaces';

@Component({
  selector: 'app-add-member-team-pop-up',
  templateUrl: './remove-member-team-pop-up.component.html',
  styleUrls: [
    './../../../../../assets/theme.css',
    './remove-member-team-pop-up.component.css',
  ],
  standalone: true,
  imports: [MatDialogModule, MatInputModule, FormsModule, MatButtonModule],
})
export class RemoveMemberTeamPopUpComponent {
  isDarkTheme: boolean = false;
  searchQuery = ''; // input from 'input matInput' is stored in searchQuery
  description = '';
  found = '';
  memberIdsToAdd: string[] = [];

  @Output() channelCreated = new EventEmitter<IChannel>();

  constructor(
    private dialogRef: MatDialogRef<RemoveMemberTeamPopUpComponent>,
    private backendService: BackendService,
    @Inject(MAT_DIALOG_DATA)
    public data: { selectedTeam: string; theme: boolean }
  ) {
    this.isDarkTheme = data.theme;
  }

  // Search for members to add to the channel
  async search() {
    console.log('Searching for:', this.searchQuery);
  }

  // remove members to the team
  async removeMembers() {
    console.log('Adding members:', this.memberIdsToAdd);
  }
}
