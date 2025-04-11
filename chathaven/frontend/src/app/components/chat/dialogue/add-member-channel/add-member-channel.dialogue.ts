import { Component, Inject, OnInit } from '@angular/core';
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
export class AddChannelMembersDialogue implements OnInit {
  isDarkTheme: boolean = false;
  searchQuery = '';
  found = '';
  memberIdsToAdd: string[] = [];
  teamMembers: IUser[] = [];

  constructor(
    private dialogRef: MatDialogRef<AddChannelMembersDialogue>,
    private backendService: BackendService,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      channelId: string;
      teamId: string;
      theme: boolean;
    }
  ) {
    this.dataService.isDarkTheme.subscribe((isDarkTheme) => {
      this.isDarkTheme = isDarkTheme;
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      const team = await this.backendService.getTeamById(this.data.teamId);
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
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
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
          tr[i].style.display = txtValue.toUpperCase().includes(input)
            ? ''
            : 'none';
        }
      }
    }
  }

  getCheckedValues() {
    const checkedValues: string[] = [];
    const checkboxes = document.querySelectorAll(
      'input[type="checkbox"]:checked'
    );
    checkboxes.forEach((checkbox) => {
      if (checkbox instanceof HTMLInputElement) {
        checkedValues.push(checkbox.value);
      }
    });
    this.memberIdsToAdd = checkedValues;
  }

  async addMembersToChannel() {
    this.getCheckedValues();
    for (const memberId of this.memberIdsToAdd) {
      await this.backendService.requestToJoin(
        'invite',
        memberId,
        this.data.channelId
      );
    }
    this.dialogRef.close();
  }
}
