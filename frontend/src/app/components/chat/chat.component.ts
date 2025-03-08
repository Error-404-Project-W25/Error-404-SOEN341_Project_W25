import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
import {
  IChannel,
  ITeam,
  IUser,
  IMessage,
  IConversation,
} from '@shared/interfaces';

import { UserAuthResponse } from '@shared/user-auth.types';

import { BehaviorSubject } from 'rxjs';

import { ChannelCreationDialog } from './dialogue/create-channel/create-channel.dialogue';
import { AddTeamMemberDialog } from './dialogue/add-member-team/add-member-team.dialogue';
import { TeamCreationDialog } from './dialogue/create-team/create-team.dialogue';
import { TeamMemberRemovalDialog } from './dialogue/remove-member-team/remove-member-team.dialogue';
import { DeleteMessageDialog } from './dialogue/delete-message/delete-message.dialogue';
import { EditChannelDialog } from './dialogue/edit-channel/edit-channel.dialogue';
import { AddChannelMembersDialogue } from './dialogue/add-member-channel/add-member-channel.dialogue';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule],
  templateUrl: './chat.component.html',
  styleUrls: [
    './../../../assets/theme.css',
    './chat.component.css',
    './component/teamSideBar.component.css',
    './component/channelSideBar.component.css',
    './component/chatLog.component.css',
    './component/informationSideBar.component.css',
  ],
})
export class ChatComponent implements OnInit, OnDestroy {
  title = 'chatHaven';

  loginUser: IUser | null = null;

  isTeamListOpen = true;
  isDarkTheme = true;
  isDirectMessage = false;

  newMessage: string = '';

  channelTitle: string = '';
  teamTitle: string = '';

  selectedTeamId: string | null = null;
  selectedChannelId: string | null = null;
  selectedMessageId: string | null = null;
  selectedConversationId: string | null = null;
  selectedChannelObject: IChannel | null = null;
  teamList: ITeam[] = [];
  channelList: IChannel[] = [];
  conversationList: IConversation[] = [];

  teamMemberList: IUser[] = [];
  chatMemberList: IUser[] = [];
  messages: IMessage[] = [];

  userIdToName: { [userId: string]: string } = {};

  private channelsSubject = new BehaviorSubject<IChannel[]>([]);
  channels$ = this.channelsSubject.asObservable();

  private skipNextTeamRefresh = false;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    private backendService: BackendService
  ) {}

  ngOnInit() {
    window.addEventListener('resize', this.handleResize.bind(this));
    this.handleResize();
    this.loginUser = this.userService.getUser() || null;

    this.userService.user$.subscribe((user) => {
      this.loginUser = user || null;
      if (user) {
        console.log('User logged in as:', user);
        this.refreshTeamList();
      } else {
        this.router.navigate(['/home']);
      }
    });
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  async refreshTeamList(): Promise<void> {
    if (this.skipNextTeamRefresh) {
      this.skipNextTeamRefresh = false;
      return;
    }

    this.isDirectMessage = false;
    this.loginUser = this.userService.getUser() || null;
    this.teamList = [];

    if (
      this.loginUser?.user_id &&
      this.loginUser?.teams &&
      this.loginUser.teams.length > 0
    ) {
      const teamPromises = this.loginUser.teams.map((teamId) =>
        this.backendService.getTeamById(teamId)
      );

      const teams = await Promise.all(teamPromises);

      this.teamList = teams.filter((team) => team !== undefined) as ITeam[];
    }
  }

  async refreshChannelList() {
    this.loginUser = this.userService.getUser() || null;
    this.channelList = [];
    const selectedTeam = this.teamList.find(
      (t) => t.team_id === this.selectedTeamId
    );
    if (selectedTeam?.channels) {
      for (const channelId of selectedTeam.channels) {
        const channel = await this.backendService.getChannelById(
          this.selectedTeamId!,
          channelId
        );
        if (channel) {
          for (const member of channel.members) {
            if (this.loginUser?.user_id === member) {
              this.channelList.push(channel);
              break;
            }
          }
        }
      }
    }
  }

  async refreshConversationList() {
    this.isDirectMessage = true;
    this.loginUser = this.userService.getUser() || null;
    this.teamTitle = 'Direct Messages';
    this.conversationList = [];
    if (this.loginUser?.direct_messages) {
      for (const conversationId of this.loginUser.direct_messages) {
        const conversation = await this.backendService.getConversationById(
          conversationId
        );
        if (conversation) {
          this.conversationList.push(conversation);
        }
      }
    }
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
  }

  openCreateTeamDialog(): void {
    if (this.loginUser?.role !== 'admin') {
      alert('You do not have the necessary permissions to create a team.');
      return;
    }
    const dialogRef = this.dialog.open(TeamCreationDialog, {
      data: { theme: this.isDarkTheme },
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result && result.team_id) {
        if (this.loginUser) {
          this.skipNextTeamRefresh = true;

          const updatedUser = await this.backendService.getUserById(
            this.loginUser.user_id
          );
          if (updatedUser) {
            this.userService.updateUser(updatedUser);

            const newTeam = await this.backendService.getTeamById(
              result.team_id
            );
            if (newTeam) {
              this.teamList.push(newTeam);

              this.selectTeam(result.team_id);
            }
          }
        }

        this.dialog.open(AddTeamMemberDialog, {
          data: { selectedTeam: result.team_id, theme: this.isDarkTheme },
        });
      }
    });
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

  openDeleteDialog(messageId: string, messageText: string): void {
    const dialogRef = this.dialog.open(DeleteMessageDialog, {
      data: { messageId, messageText, theme: this.isDarkTheme },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.messages = this.messages.filter((msg) => msg.messageId !== result);
      }
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
      data: {
        name: channel.name,
        description: channel.description,
        channel_id: channel.channel_id,
        team_id: this.selectedTeamId,
        isDarkTheme: this.isDarkTheme,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const teamIndex = this.teamList.findIndex(
          (t) => t.team_id === this.selectedTeamId
        );
        if (teamIndex > -1) {
          const channelIndex = this.teamList[teamIndex].channels.findIndex(
            (c) => c === channel.channel_id
          );
          if (channelIndex > -1) {
            this.teamList[teamIndex].channels[channelIndex] = result.channel_id;
          }
        }
      }
    });
  }

  selectTeam(team: string): void {
    this.isDirectMessage = false;
    let teamMemberListID: string[] = [];
    this.teamMemberList = [];
    this.selectedTeamId = team;
    this.backendService.getTeamById(team).then((teamData) => {
      if (teamData) {
        this.channelList = [];
        this.teamTitle = teamData.team_name || '';
        teamMemberListID = teamData.members || [];
        teamData.channels.forEach(async (channelId) => {
          const channel = await this.backendService.getChannelById(
            team,
            channelId
          );
          if (channel) {
            this.channelList.push(channel);
          }
        });
      }
      teamMemberListID.forEach((member) => {
        this.backendService.getUserById(member).then((userData) => {
          if (userData) {
            this.teamMemberList.unshift(userData);
          }
        });
      });
      this.channelTitle = '';
      this.refreshChannelList();
      this.handleResize();
    });
  }

  async selectChannel(channelId: string): Promise<void> {
    if (this.selectedTeamId) {
      const selectedChannel = await this.backendService.getChannelById(
        this.selectedTeamId,
        channelId
      );
      this.selectedChannelObject = selectedChannel || null;
      if (selectedChannel) {
        this.selectedChannelId = channelId;
        this.channelTitle = selectedChannel.name;
        this.chatMemberList = [];
        selectedChannel.members.forEach(async (memberId: string) => {
          const userData = await this.backendService.getUserById(memberId);
          if (userData) {
            this.chatMemberList.push(userData);
          }
        });
        await this.loadMessages(selectedChannel.conversationId);
      }
    }
  }

  async selectConversationId(conversationId: string): Promise<void> {
    this.selectedChannelObject = null;
    const conversation = await this.backendService.getConversationById(
      conversationId
    );
    if (conversation) {
      this.selectedConversationId = conversationId;
      this.messages = conversation.messages;
      await this.loadUserNames();
    }
  }

  async loadMessages(conversationId: string): Promise<void> {
    const messages = await this.backendService.getMessages(conversationId);
    if (messages) {
      this.messages = messages;
      await this.loadUserNames();
    }
    this.messages.reverse();
  }

  async selectConversation(conversationObject: IConversation): Promise<void> {
    this.channelTitle = conversationObject.conversationName;
    this.selectedConversationId = conversationObject.conversationId;
    await this.loadMessages(conversationObject.conversationId);
  }

  async sendMessage() {
    if (this.newMessage) {
      if (this.selectedChannelObject) {
        const sender = this.userService.getUser();
        if (sender) {
          const success = await this.backendService.sendMessage(
            this.newMessage,
            this.selectedChannelObject.conversationId,
            sender.user_id
          );
          this.newMessage = '';
          if (success) {
            await this.loadMessages(this.selectedChannelObject.conversationId);
          }
        }
      } else if (this.selectedConversationId) {
        const sender = this.userService.getUser();
        if (sender) {
          const success = await this.backendService.sendMessage(
            this.newMessage,
            this.selectedConversationId,
            sender.user_id
          );
          this.newMessage = '';
          if (success) {
            await this.loadMessages(this.selectedConversationId);
          }
        }
      }
    }
  }

  async createCoversation(memberId: string) {
    const sender = this.userService.getUser();
    const receiver = await this.backendService.getUserById(memberId);
    const conversationName = `Conversation: ${sender?.username}, ${receiver?.username}`;
    if (sender && receiver?.user_id) {
      const conversation = await this.backendService.createDirectMessages(
        conversationName,
        sender.user_id,
        receiver.user_id
      );
    }
  }

  async signOut() {
    const response: UserAuthResponse | undefined =
      await this.backendService.logoutUser();
    if (response && !response.error) {
      this.userService.clearUser();
      this.router.navigate(['/']);
    } else if (response) {
      console.error(response.error);
    } else {
      console.error('No response from backend');
    }
  }

  myChannelFunction() {
    const dropdown = document.getElementById('myDropdownChannel');
    if (dropdown) {
      dropdown.classList.toggle('channelList-show');
    }
  }

  toggleTeamList() {
    this.isTeamListOpen = !this.isTeamListOpen;
    this.handleTeamListResize();
  }

  handleTeamListResize() {
    const chatBox = document.querySelector('.chat-box') as HTMLElement;
    const teamSidebar = document.querySelector(
      '.team-setting-sidebar'
    ) as HTMLElement;
    if (teamSidebar) {
      if (this.isTeamListOpen) {
        teamSidebar.style.display = 'none';
        chatBox.style.width = 'calc(100% - 20rem)';
        this.isTeamListOpen = false;
      } else {
        teamSidebar.style.display = 'flex';
        chatBox.style.width = 'calc(100% - 40rem)';
        this.isTeamListOpen = true;
      }
    }
  }

  handleResize() {
    const chatBox = document.querySelector('.chat-box') as HTMLElement;
    const teamSidebar = document.querySelector(
      '.team-setting-sidebar'
    ) as HTMLElement;
    if (window.innerWidth < 1135) {
      this.isTeamListOpen = true;
    } else {
      this.isTeamListOpen = false;
    }
    this.toggleTeamList();
  }

  async loadUserNames(): Promise<void> {
    const uniqueSenderIds = [
      ...new Set(this.messages.map((msg) => msg.sender)),
    ];

    for (const userId of uniqueSenderIds) {
      const user = await this.backendService.getUserById(userId);
      if (user) {
        this.userIdToName[userId] = user.username;
      }
    }
  }

  getUserName(userId: string): string {
    return this.userIdToName[userId] || userId;
  }
}
