import { Component, EventEmitter, Inject, Output } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { NgFor, NgIf } from '@angular/common';
import { BackendService } from '@services/backend.service';
import { IUser, IChannel, ITeam } from '@shared/interfaces';

@Component({
  selector: 'app-add-member-channel-pop-up',
  standalone: true,
  imports: [
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    NgFor,
  ],
  templateUrl: './add-member-channel.dialogue.html',
  styleUrls: [
    './../../../../../assets/theme.css',
    './add-member-channel.dialogue.css',
  ],
})
export class AddChannelMembersDialogue {
  isDarkTheme: boolean = false;
  searchQuery = '';
  found = '';
  memberIdsToAdd: string[] = [];
  teamMembers: IUser[] = [];

  constructor(
    private dialogRef: MatDialogRef<AddChannelMembersDialogue>,
    private backendService: BackendService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      channel_id: string;
      team_id: string;
      theme: boolean;
    }
  ) {
    this.backendService.getTeamById(this.data.team_id).then(async (team) => {
      if (team) {
        const members = await Promise.all(
          team.members.map((memberId) =>
            this.backendService.getUserById(memberId)
          )
        );
        this.teamMembers = members.filter(
          (member): member is IUser => member !== undefined
        );
      } else {
        console.error('Team not found');
      }
    });
    this.isDarkTheme = data.theme;
  }

  search() {
    const input = this.searchQuery.toUpperCase();
    const table = document.getElementById('myTable');
    if (table) {
      const tr = table.getElementsByTagName('tr');
      for (let i = 0; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName('td')[0];
        if (td) {
          const txtValue = td.textContent || td.innerText;
          if (txtValue.toUpperCase().indexOf(input) > -1) {
            tr[i].style.display = '';
          } else {
            tr[i].style.display = 'none';
          }
        }
      }
    }
  }

  getCheckedValues() {
    const checkedValues: string[] = [];
    const checkboxes = document.querySelectorAll(
      'input[type="checkbox"]:checked'
    );
    console.log('Checkboxes:', checkboxes);
    checkboxes.forEach((checkbox) => {
      if (checkbox instanceof HTMLInputElement) {
        console.log('Checkbox:', checkbox);
        checkedValues.push(checkbox.value);
        console.log('Checked values:', checkedValues);
      }
    });
    this.memberIdsToAdd = checkedValues;
  }

  async addMembersToChannel() {
    this.getCheckedValues();
    console.log('1Adding members:', this.memberIdsToAdd);
    for (const memberId of this.memberIdsToAdd) {
      try {
        const response: boolean = await this.backendService.addUserToChannel(
          this.data.team_id,
          this.data.channel_id,
          memberId
        );
        if (response) {
          console.log('Added member:', memberId);
        } else {
          console.error('Failed to add member:', memberId);
        }
      } catch (error) {
        console.error('Error adding member:', error);
      }
    }
    this.dialogRef.close();
  }
}
