import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
import { IChannel, IConversation, IUser, IInbox } from '@shared/interfaces';
import { ChannelCreationDialog } from '../../dialogue/create-channel/create-channel.dialogue';
import { AddChannelMembersDialogue } from '../../dialogue/add-member-channel/add-member-channel.dialogue';
import { AddTeamMemberDialog } from '../../dialogue/add-member-team/add-member-team.dialogue';
import { EditChannelDialog } from '../../dialogue/edit-channel/edit-channel.dialogue';
import { TeamMemberRemovalDialog } from '../../dialogue/remove-member-team/remove-member-team.dialogue';
import { DataService } from '@services/data.service';
import { JoinRequestDialog } from '../../dialogue/join-request/join-request.dialogue';
import { RemoveMemberDialogComponent } from '../../dialogue/leave-channel/leave-channel.dialogue';

@Component({
  selector: 'chat-channel-sidebar',
  templateUrl: './channelSideBar.component.html',
  styleUrls: ['./channelSideBar.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule],
})
export class ChannelSidebarComponent implements OnInit, OnDestroy {
  selectedTeamId: string | null = null;
  isDirectMessage: boolean = false;
  teamTitle: string = '';
  loginUser: IUser | undefined = undefined;
  loginUserId: string = '';
  selectedChannelId: string | null = null;
  channelList: IChannel[] = [];
  requestList: IInbox[] = [];
  selectedDirectMessageId: string | null = null;
  directMessageList: IConversation[] = [];
  channels: IChannel[] = [];
  channelIdToLastMessage: { [channelId: string]: string } = {};
  conversationId: string | null = null;

  constructor(
    public dialog: MatDialog,
    private userService: UserService,
    private backendService: BackendService,
    private dataService: DataService
  ) {
    this.dataService.isDirectMessage.subscribe((isDirectMessage) => {
      this.isDirectMessage = isDirectMessage;
      isDirectMessage
        ? this.refreshDirectMessageList()
        : this.refreshChannelList();
    });
    this.dataService.currentTeamId.subscribe((teamId) => {
      this.selectedTeamId = teamId;
    });
  }

  ngOnInit() {
    this.loginUserId = this.userService.getUser()?.userId || '';
    this.refreshChannelList();
  }

  ngOnDestroy() {}

  isChannelInbox(channelId: string): boolean {
    return this.requestList.some((inbox) => inbox.channelId === channelId);
  }

  getChannelLastMessage(channelId: string): string {
    return this.channelIdToLastMessage[channelId] || ' ';
  }

  async refreshChannelList() {
    const list: IChannel[] = [];
    this.channelList = [];
    const selectedTeam = this.selectedTeamId
      ? await this.backendService.getTeamById(this.selectedTeamId)
      : null;
    this.teamTitle = selectedTeam?.teamName || '';
    const channelListId = selectedTeam?.channels || [];

    for (const channelId of channelListId) {
      const channel = await this.backendService.getChannelById(channelId);
      if (channel) {
        list.push(channel);
        this.channelIdToLastMessage[channel.channelId] =
          (await this.getConversationLastMessage(channel.conversationId)) || '';
      }
    }
    this.channelList = list;
  }

  async refreshDirectMessageList() {
    const list: IConversation[] = [];
    this.directMessageList = [];
    const directMessageListId =
      this.userService.getUser()?.directMessages || [];

    for (const directMessageId of directMessageListId) {
      const directMessage = await this.backendService.getConversationById(
        directMessageId
      );
      if (directMessage) {
        list.push(directMessage);
      }
    }
    this.directMessageList = list;
    this.teamTitle = 'Direct Messages';
  }

  openCreateChannelDialog(): void {
    const dialogRef = this.dialog.open(ChannelCreationDialog, {
      data: { selectedTeam: this.selectedTeamId },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.channelId) {
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
        this.refreshChannelList();
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

  openLeaveChannelDialog(channel: IChannel): void {
    const dialogRef = this.dialog.open(RemoveMemberDialogComponent, {
      data: {
        channelId: channel.channelId,
        memberId: this.userService.getUser()?.userId,
      },
    });

    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.refreshChannelList();
        if (this.selectedChannelId === channel.channelId) {
          this.dataService.selectChannel('');
          this.dataService.selectConversation('');
        }
      }
    });
  }

  selectChannel(channelId: string): void {
    this.backendService.getChannelById(channelId).then((channel) => {
      if (
        channel &&
        channel.members.includes(this.userService.getUser()?.userId || '')
      ) {
        this.selectedChannelId = channel.channelId;
        this.dataService.selectChannel(this.selectedChannelId);
        this.dataService.selectConversation(channel.conversationId);
        if (this.isDirectMessage) {
          this.dataService.toggleIsDirectMessage(false);
        }
      } else {
        this.dialog.open(JoinRequestDialog, {
          data: { channelId: channelId, teamId: this.selectedTeamId },
        });
      }
    });
  }

  selectDirectMessage(directMessageId: string): void {
    this.dataService.selectConversation(directMessageId);
  }

  isChannelMember(channel: IChannel): boolean {
    return channel.members.includes(this.userService.getUser()?.userId || '');
  }

  isPrivateChannel(channel: IChannel): boolean {
    return channel.name.toLowerCase().includes('private');
  }

  handleChannelSelection(channel: IChannel): void {
    if (this.isPrivateChannel(channel) && !this.isChannelMember(channel)) {
      return;
    }
    this.selectChannel(channel.channelId);
  }

  async getConversationLastMessage(
    conversationId: string
  ): Promise<string | null> {
    try {
      const conversation = await this.backendService.getConversationById(
        conversationId
      );
      if (conversation?.messages?.length) {
        return (
          conversation.messages[conversation.messages.length - 1].content ||
          null
        );
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}
