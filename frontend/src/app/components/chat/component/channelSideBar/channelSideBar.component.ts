import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
import { IChannel, ITeam, IUser } from '@shared/interfaces';
import { UserAuthResponse } from '@shared/user-auth.types';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ChannelCreationDialog } from '../../dialogue/create-channel/create-channel.dialogue';
import { AddChannelMembersDialogue } from '../../dialogue/add-member-channel/add-member-channel.dialogue';
import { AddTeamMemberDialog } from '../../dialogue/add-member-team/add-member-team.dialogue';
import { EditChannelDialog } from '../../dialogue/edit-channel/edit-channel.dialogue';
import { TeamMemberRemovalDialog } from '../../dialogue/remove-member-team/remove-member-team.dialogue';

@Component({
  selector: 'app-side-bar-channel',
  templateUrl: './channelSideBar.component.html',
  styleUrls: [
    './../channelSideBar.component.css',
    './../../../../../assets/theme.css',
  ],
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule],
})
export class ChannelSideBarComponent implements OnInit, OnDestroy {
  @Input() title = 'chatHaven';
  @Input() selectedTeam!: ITeam;
  @Input() isDarkTheme: boolean | null = null;

  selectChannelID: string | null = null;
  channelList: IChannel[] = [];
  conversationList: IChannel[] = [];
  teamTitle: string = '';

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    private backendService: BackendService
  ) {}

  ngOnInit() {
    if (this.selectedTeam) {
      this.teamTitle = this.selectedTeam.team_name;
    }
    this.refreshChannelList();
  }

  ngOnDestroy() {}

  refreshChannelList() {
    this.channelList = this.selectedTeam.channels;
  }

  openCreateChannelDialog() {
    this.dialog.open(ChannelCreationDialog, {
      data: {
        selectedTeam: this.selectedTeam.team_id,
        theme: this.isDarkTheme,
      },
    });
  }

  openAddMemberTeamDialog() {
    if (!this.selectedTeam.team_id) {
      alert('No team selected');
      return;
    }
    this.dialog.open(AddTeamMemberDialog, {
      data: {
        selectedTeam: this.selectedTeam.team_id,
        theme: this.isDarkTheme,
      },
    });
  }

  openRemoveMemberTeamDialog() {
    this.dialog.open(TeamMemberRemovalDialog, {
      data: {
        selectedTeam: this.selectedTeam.team_id,
        theme: this.isDarkTheme,
      },
    });
  }

  selectConversation(channelId: string) {
    // Implementation for selecting a conversation
  }

  selectChannel(channelId: string) {
    // Implementation for selecting a channel
  }

  myConvoFunction() {
    const dropdown = document.getElementById('myDropdownConvo');
    if (dropdown) {
      dropdown.classList.toggle('channelList-show');
    }
  }

  myChannelFunction() {
    const dropdown = document.getElementById('myDropdownChannel');
    if (dropdown) {
      dropdown.classList.toggle('channelList-show');
    }
  }

  openAddMemberChannelDialog(channel: IChannel) {
    const dialogRef = this.dialog.open(AddChannelMembersDialogue, {
      data: {
        channel_id: channel.channel_id,
        team_id: this.selectedTeam.team_id,
        theme: this.isDarkTheme,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.added) {
        // Handle the result if needed
      }
    });
  }

  openEditChannelDialog(channel: IChannel) {
    const dialogRef = this.dialog.open(EditChannelDialog, {
      data: {
        name: channel.name,
        description: channel.description,
        channel_id: channel.channel_id,
        team_id: this.selectedTeam.team_id,
        isDarkTheme: this.isDarkTheme,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const teamIndex = this.selectedTeam.channels.findIndex(
          (c) => c.channel_id === channel.channel_id
        );
        if (teamIndex > -1) {
          this.selectedTeam.channels[teamIndex] = {
            ...this.selectedTeam.channels[teamIndex],
            ...result,
          };
        }
      }
    });
  }
}
