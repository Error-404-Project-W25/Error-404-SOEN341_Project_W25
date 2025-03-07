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
import { AddChannelDialogComponent } from '../../dialogue/create-channel-dialogue/add-channel-dialog.component';
import { AddMemberChannelPopUpComponent } from '../../dialogue/add-member-channel-dialogue/add-member-channel-pop-up.component';
import { AddMemberTeamPopUpComponent } from '../../dialogue/add-member-team-dialogue/add-member-team-pop-up.component';
import { EditChannelPopUpComponent } from '../../dialogue/edit-channel-dialogue/edit-channel-pop-up.component';
import { RemoveMemberTeamPopUpComponent } from '../../dialogue/remove-member-team-dialogue/remove-member-team-pop-up.component';

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
    this.dialog.open(AddChannelDialogComponent, {
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
    this.dialog.open(AddMemberTeamPopUpComponent, {
      data: {
        selectedTeam: this.selectedTeam.team_id,
        theme: this.isDarkTheme,
      },
    });
  }

  openRemoveMemberTeamDialog() {
    this.dialog.open(RemoveMemberTeamPopUpComponent, {
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
    const dialogRef = this.dialog.open(AddMemberChannelPopUpComponent, {
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
    const dialogRef = this.dialog.open(EditChannelPopUpComponent, {
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
