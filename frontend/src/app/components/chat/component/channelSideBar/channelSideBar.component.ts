import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
import { IChannel, IConversation, ITeam, IUser } from '@shared/interfaces';
import { UserAuthResponse } from '@shared/user-auth.types';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ChannelCreationDialog } from '../../dialogue/create-channel/create-channel.dialogue';
import { AddChannelMembersDialogue } from '../../dialogue/add-member-channel/add-member-channel.dialogue';
import { AddTeamMemberDialog } from '../../dialogue/add-member-team/add-member-team.dialogue';
import { EditChannelDialog } from '../../dialogue/edit-channel/edit-channel.dialogue';
import { TeamMemberRemovalDialog } from '../../dialogue/remove-member-team/remove-member-team.dialogue';
import { DataService } from '@services/data.service';

@Component({
  selector: 'chat-channel-sidebar',
  templateUrl: './channelSideBar.component.html',
  styleUrls: [
    './channelSideBar.component.css',
    './../../../../../assets/theme.css',
  ],
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule],
})
export class ChannelSidebarComponent implements OnInit, OnDestroy {
  //verification if user is login
  loginUser: IUser | null = null;

  //input
  @Input() userId: string = '';
  selectedTeamId: string | null = null;
  isDirectMessage: boolean = false;
  isDarkTheme: boolean = false;

  //variables
  teamTitle: string = '';

  selectedChannelID: string | null = null;
  channelList: IChannel[] = [];

  selectedDirectMessageID: string | null = null;
  directMessageList: IConversation[] = [];

  //output
  conversationId: string | null = null;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    private backendService: BackendService,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.userService.user$.subscribe((user) => {
      this.loginUser = user || null;
      if (!user) {
        this.router.navigate(['/login']);
      }
    });

    this.dataService.isDirectMessage.subscribe((isDirectMessage) => {
      this.isDirectMessage = isDirectMessage;
      if (isDirectMessage) {
        this.refreshDirectMessageList();
      } else {
        this.dataService.currentTeamId.subscribe((teamId) => {
          this.selectedTeamId = teamId;
        });
        this.refreshChannelList();
      }
    });
    this.dataService.isDarkTheme.subscribe((isDarkTheme) => {
      this.isDarkTheme = isDarkTheme;
    });
  }

  ngOnDestroy() {}

  async refreshChannelList() {
    let selectedTeam = this.selectedTeamId
      ? await this.backendService.getTeamById(this.selectedTeamId)
      : null;
    this.teamTitle = selectedTeam?.team_name || '';
    let channelListID = selectedTeam?.channels || [];
    this.channelList = [];
    channelListID.forEach(async (channelID) => {
      const channel = await this.backendService.getChannelById(
        this.selectedTeamId!,
        channelID
      );

      if (channel && channel.members.includes(this.userId || '')) {
        this.channelList.push(channel);
        console.log('Channel List:', this.channelList);
      }
    });

    console.log('Team Title:', this.teamTitle);
  }

  refreshDirectMessageList() {
    this.loginUser = this.userService.getUser() || null;
    let directMessageListId = this.loginUser?.direct_messages || [];
    this.directMessageList = [];
    directMessageListId.forEach(async (directMessageID) => {
      const directMessage = await this.backendService.getConversationById(
        directMessageID
      );
      if (directMessage) {
        this.directMessageList.push(directMessage);
        console.log('Direct Message List:', this.directMessageList);
      }
    });
    this.teamTitle = 'Direct Messages';
    console.log('Team Title:', this.teamTitle);
  }

  openCreateChannelDialog(): void {
    const dialogRef = this.dialog.open(ChannelCreationDialog, {
      data: { selectedTeam: this.selectedTeamId, theme: this.isDarkTheme },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.channel_id) {
        this.dialog.open(AddChannelMembersDialogue, {
          data: {
            channel_id: result.channel_id,
            team_id: this.selectedTeamId,
            theme: this.isDarkTheme,
          },
        });
        this.refreshChannelList();
      }
    });
  }

  openAddMemberTeamDialog(): void {
    if (!this.selectedTeamId) {
      alert('No team selected');
      return;
    }
    this.dialog.open(AddTeamMemberDialog, {
      data: { selectedTeam: this.selectedTeamId, theme: this.isDarkTheme },
    });
  }

  openRemoveMemberTeamDialog(): void {
    this.dialog.open(TeamMemberRemovalDialog, {
      data: { selectedTeam: this.selectedTeamId, theme: this.isDarkTheme },
    });
  }

  openAddMemberChannelDialog(channel: IChannel): void {
    const dialogRef = this.dialog.open(AddChannelMembersDialogue, {
      data: {
        channel_id: channel.channel_id,
        team_id: this.selectedTeamId,
        theme: this.isDarkTheme,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.added) {
      }
    });
  }

  openEditChannelDialog(channel: IChannel): void {
    const dialogRef = this.dialog.open(EditChannelDialog, {
      data: { channel: channel, theme: this.isDarkTheme },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.edited) {
        this.refreshChannelList();
      }
    });
  }

  selectChannel(channelId: string): void {
    this.backendService
      .getChannelById(this.selectedTeamId!, channelId)
      .then((channel) => {
        if (channel) {
          this.selectedChannelID = channel.channel_id;
          this.dataService.selectChannel(channel.channel_id);
          this.dataService.selectConversation(channel.conversationId);
        }
      });
  }

  selectDirectMessage(directMessageId: string): void {
    this.dataService.selectConversation(directMessageId);
  }
}
