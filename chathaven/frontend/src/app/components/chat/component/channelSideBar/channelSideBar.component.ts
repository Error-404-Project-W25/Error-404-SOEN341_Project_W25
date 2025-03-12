import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
import { IChannel, IConversation, IUser } from '@shared/interfaces';
import { ChannelCreationDialog } from '../../dialogue/create-channel/create-channel.dialogue';
import { AddChannelMembersDialogue } from '../../dialogue/add-member-channel/add-member-channel.dialogue';
import { AddTeamMemberDialog } from '../../dialogue/add-member-team/add-member-team.dialogue';
import { EditChannelDialog } from '../../dialogue/edit-channel/edit-channel.dialogue';
import { TeamMemberRemovalDialog } from '../../dialogue/remove-member-team/remove-member-team.dialogue';
import { DataService } from '@services/data.service';

@Component({
  selector: 'chat-channel-sidebar',
  templateUrl: './channelSideBar.component.html',
  styleUrls: ['./channelSideBar.component.css'],
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

  //variables
  teamTitle: string = '';

  selectedChannelId: string | null = null;
  channelList: IChannel[] = [];

  selectedDirectMessageId: string | null = null;
  directMessageList: IConversation[] = [];

  //output
  conversationId: string | null = null;

  constructor(
    public dialog: MatDialog,
    private userService: UserService,
    private backendService: BackendService,
    private dataService: DataService
  ) {}

  ngOnInit() {
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
  }

  ngOnDestroy() {}

  async refreshChannelList() {
    let selectedTeam = this.selectedTeamId
      ? await this.backendService.getTeamById(this.selectedTeamId)
      : null;
    this.teamTitle = selectedTeam?.teamName || '';
    let channelListId = selectedTeam?.channels || [];
    this.channelList = [];

    // Fetch all channels without filtering by membership
    for (const channelId of channelListId) {
      const channel = await this.backendService.getChannelById(
        this.selectedTeamId!,
        channelId
      );

      if (channel) {
        // Add all channels to the list, regardless of membership
        this.channelList.push(channel);
      }
    }
  }

  refreshDirectMessageList() {
    this.loginUser = this.userService.getUser() || null;
    let directMessageListId = this.loginUser?.directMessages || [];
    this.directMessageList = [];
    directMessageListId.forEach(async (directMessageId) => {
      const directMessage = await this.backendService.getConversationById(
        directMessageId
      );
      if (directMessage) {
        this.directMessageList.push(directMessage);
      }
    });
    this.teamTitle = 'Direct Messages';
  }

  openCreateChannelDialog(): void {
    const dialogRef = this.dialog.open(ChannelCreationDialog, {
      data: { selectedTeam: this.selectedTeamId },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.channelId) {
        this.dialog.open(AddChannelMembersDialogue, {
          data: {
            channelId: result.channelId,
            teamId: this.selectedTeamId,
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
      data: { selectedTeam: this.selectedTeamId },
    });
  }

  openRemoveMemberTeamDialog(): void {
    this.dialog.open(TeamMemberRemovalDialog, {
      data: { selectedTeam: this.selectedTeamId },
    });
  }

  openAddMemberChannelDialog(channel: IChannel): void {
    const dialogRef = this.dialog.open(AddChannelMembersDialogue, {
      data: {
        channelId: channel.channelId,
        teamId: this.selectedTeamId,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.added) {
      }
    });
  }

  openEditChannelDialog(channel: IChannel): void {
    const dialogRef = this.dialog.open(EditChannelDialog, {
      data: { channel: channel },
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
          this.selectedChannelId = channel.channelId;
          this.dataService.selectChannel(this.selectedChannelId);
          this.dataService.selectConversation(channel.conversationId);
        }
      });
  }

  selectDirectMessage(directMessageId: string): void {
    this.dataService.selectConversation(directMessageId);
  }

  isChannelMember(channel: IChannel): boolean {
    return channel.members.includes(this.userId || '');
  }

  isPrivateChannel(channel: IChannel): boolean {
    // Implement your logic to determine if a channel is private
    // For example, check the channel name or another property
    return channel.name.toLowerCase().includes('private');
  }

  handleChannelSelection(channel: IChannel): void {
    if (this.isPrivateChannel(channel) && !this.isChannelMember(channel)) {
      // Maybe show a tooltip/message that this is a private channel
      return;
    }

    this.selectChannel(channel.channelId);
  }
}

