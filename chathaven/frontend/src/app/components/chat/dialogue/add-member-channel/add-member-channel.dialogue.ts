import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { NgFor } from '@angular/common';
import { IUser } from '@shared/interfaces';
import { BackendService } from '@services/backend.service';
import { DataService } from '@services/data.service';
import { UserService } from '@services/user.service';

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
  styleUrls: ['./add-member-channel.dialogue.css'],
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
    private dataService: DataService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      channelId: string;
      teamId: string;
      theme: boolean;
    }
  ) {
    this.backendService.getTeamById(this.data.teamId).then(async (team) => {
      if (team) {
        this.teamMembers = (
          await Promise.all(
            team.members.map((memberId) =>
              this.backendService.getUserById(memberId)
            )
          )
        ).filter(
          (member): member is IUser =>
            member !== undefined &&
            member.userId !== this.userService.getUser()?.userId
        );
      } else {
        console.error('Team not found');
      }
    });
    this.dataService.isDarkTheme.subscribe((isDarkTheme) => {
      this.isDarkTheme = isDarkTheme;
    });
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
      this.backendService.requestToJoin(
        'invite',
        memberId,
        this.data.channelId
      );
    }
    this.dialogRef.close();
  }
}
