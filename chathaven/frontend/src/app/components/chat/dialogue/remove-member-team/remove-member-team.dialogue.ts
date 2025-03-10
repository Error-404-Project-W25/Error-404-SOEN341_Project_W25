import { Component, EventEmitter, Inject, Output } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { IChannel } from '@shared/interfaces';
import { BackendService } from '@services/backend.service';
import { DataService } from '@services/data.service';

@Component({
  selector: 'app-add-member-team-pop-up',
  templateUrl: './remove-member-team.dialogue.html',
  styleUrls: ['./remove-member-team.dialogue.css'],
  standalone: true,
  imports: [MatDialogModule, MatInputModule, FormsModule, MatButtonModule],
})
export class TeamMemberRemovalDialog {
  isDarkTheme: boolean = false;
  searchQuery = ''; // input from 'input matInput' is stored in searchQuery
  description = '';
  found = '';
  memberIdsToAdd: string[] = [];

  @Output() channelCreated = new EventEmitter<IChannel>();

  constructor(
    private dialogRef: MatDialogRef<TeamMemberRemovalDialog>,
    private backendService: BackendService,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA)
    public data: { selectedTeam: string; theme: boolean }
  ) {
    this.dataService.isDarkTheme.subscribe((isDarkTheme) => {
      this.isDarkTheme = isDarkTheme;
    });
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
