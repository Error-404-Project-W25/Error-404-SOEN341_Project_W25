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
  requestList: IInbox[] = [];

  selectedDirectMessageId: string | null = null;
  directMessageList: IConversation[] = [];
  inviteList: IInbox[] = [];

  channels: IChannel[] = [];
  channelIdToLastMessage: { [channelId: string]: string } = {};

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
        console.log('refreshing direct message list');
        this.refreshDirectMessageList();
      } else {
        this.dataService.currentTeamId.subscribe((teamId) => {
          this.selectedTeamId = teamId;
        });
        this.refreshChannelList();
      }
    });
    this.backendService.getUserById(this.userId).then((user) => {
      if (user) {
        if (user.inbox) {
          this.requestList = user.inbox.filter(
            (inbox) => inbox.type === 'request'
          );
          this.inviteList = user.inbox.filter(
            (inbox) => inbox.type === 'invite'
          );
        }
      }
    });
  }
  // async loadLastMessage(): Promise<void> {
  //   const channelIdToLastMessage: { [channelId: string]: string } = {};

  //   const uniqueChannelIds = [
  //     ...new Set(this.channels.map((channel) => channel.channelId)),
  //   ];
  //   console.log('uniqueChannelIds:', uniqueChannelIds);
  //   for (const channelId of uniqueChannelIds) {
  //     console.log('channelId:', channelId);
  //     const conversation = await this.backendService.getConversationById(
  //       channelId
  //     );
  //     if (conversation) {
  //       channelIdToLastMessage[channelId] =
  //         conversation.messages[0]?.content || '';
  //       console.log('conversation:', conversation);
  //     }
  //   }

  //   console.log('channelIdToLastMessage:', channelIdToLastMessage);
  //   this.channelIdToLastMessage = channelIdToLastMessage;
  // }
  ngOnDestroy() {}

  isChannelInbox(channelId: string): boolean {
    return this.requestList.some((inbox) => inbox.channelId === channelId);
  }

  getChannelLastMessage(channelId: string): string {
    return this.channelIdToLastMessage[channelId] || ' ';
  }

  async refreshChannelList() {
    let selectedTeam = this.selectedTeamId
      ? await this.backendService.getTeamById(this.selectedTeamId)
      : null;
    this.teamTitle = selectedTeam?.teamName || '';
    let channelListId = selectedTeam?.channels || [];
    this.channelList = [];
    channelListId.forEach(async (channelId) => {
      const channel = await this.backendService.getChannelById(
        this.selectedTeamId!,
        channelId
      );

      if (channel) {
        this.channelList.push(channel);
        const lastMessage = await this.getConversationLastMessage(
          // channel.conversationId
          channel
        );
        // console.log('last message:', lastMessage);
        this.channelIdToLastMessage[channel.channelId] = lastMessage || '';
        console.log('channelIdToLastMessage:', this.channelIdToLastMessage);
      }
    });
    // await this.loadLastMessage();
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
        console.log('direct message:', directMessage);
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
        if (channel && channel.members.includes(this.userId || '')) {
          this.selectedChannelId = channel.channelId;
          this.dataService.selectChannel(this.selectedChannelId);
          this.dataService.selectConversation(channel.conversationId);
        } else {
          // alert('You are not a member of this channel');
          this.dialog.open(JoinRequestDialog, {
            data: { channelId: channelId, teamId: this.selectedTeamId },
          });
        }
      });
  }

  selectDirectMessage(directMessageId: string): void {
    this.dataService.selectConversation(directMessageId);
  }
  async getConversationLastMessage(
    // conversationId: string
    channel: IChannel
  ): Promise<string | null> {
    // console.log('conversationId:', conversationId);
    try {
      // console.log('channel:', channel);
      const conversation = await this.backendService.getConversationById(
        channel.conversationId || ''
      );
      // console.log('conversation:', conversation);
      console.log(
        'conversation',
        conversation?.conversationId,
        ' last message:',
        conversation?.messages[0]
      );
      return conversation?.messages?.[0]?.content || null;
    } catch (error) {
      console.log('error:', error);
      return null;
    }
  }
}
