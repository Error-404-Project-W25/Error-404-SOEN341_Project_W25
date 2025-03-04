import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
import { WebSocketService } from '@services/webSocket.service';
import {
  IChannel,
  ITeam,
  IUser,
  IMessage,
  IConversation,
} from '@shared/interfaces';

import { UserAuthResponse } from '@shared/user-auth.types';

import { BehaviorSubject, Subscription } from 'rxjs';

import { AddChannelDialogComponent } from './dialogue/create-channel-pop-up/add-channel-dialog.component';
import { AddMemberTeamPopUpComponent } from './dialogue/add-member-team-pop-up/add-member-team-pop-up.component';
import { AddTeamDialogComponent } from './dialogue/create-team-pop-up/add-team-dialog.component';
import { RemoveMemberTeamPopUpComponent } from './dialogue/remove-member-team-pop-up/remove-member-team-pop-up.component';
import { DeleteMessageComponent } from './dialogue/moderate-channel-messages/delete-message/delete-message.component';
import { EditChannelPopUpComponent } from './dialogue/edit-channel-pop-up/edit-channel-pop-up.component';
import { AddMemberChannelPopUpComponent } from './dialogue/add-member-channel-pop-up/add-member-channel-pop-up.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule],
  templateUrl: './chat.component.html',
  styleUrls: [
    './../../../assets/theme.css',
    './chat.component.css',
    './component/sideBarOne.css',
    './component/sideBarTwo.css',
    './component/chatLog.css',
    './component/teamList.css',
  ],
})
export class ChatComponent implements OnInit, OnDestroy {
  title = 'chatHaven';

  loginUser: IUser | null = null;

  isTeamListOpen = true;
  isDarkTheme = true;

  newMessage: string = '';

  channelTitle: string = '';
  teamTitle: string = '';

  selectedTeamId: string | null = null;
  selectedChannelId: string | null = null;
  selectedMessageId: string | null = null;

  selectedChannelObject: IChannel | null = null;

  teamList: ITeam[] = [];
  channelList: IChannel[] = [];
  conversationList: IConversation[] = [];

  teamMemberList: IUser[] = [];
  chatMemberList: IUser[] = [];
  messages: IMessage[] = [];

  // private teamCreatedSubscription: Subscription | null = null;
  // private channelCreatedSubscription: Subscription | null = null;

  // private channelsSubject = new BehaviorSubject<IChannel[]>([]);
  // private teamsSubject = new BehaviorSubject<ITeam[]>([]);
  // teams$ = this.teamsSubject.asObservable();
  // channels$ = this.channelsSubject.asObservable();

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    private backendService: BackendService,
    private webSocketService: WebSocketService
  ) {}

  //////////////////////////////////////////////Chat Page Setup//////////////////////////////////////////////
  ngOnInit() {
    window.addEventListener('resize', this.handleResize.bind(this));
    this.handleResize();
    this.loginUser = this.userService.getUser() || null;
    if (!this.loginUser) {
      this.userService.user$.subscribe((user) => {
        this.loginUser = user || null;
        this.refreshTeamList();
      });
    }
    this.userService.user$.subscribe((user: IUser | undefined) => {
      if (user) {
        console.log('User:', user);
        this.teamList = user.teams;
      } else {
        console.log('No user');
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  refreshTeamList() {
    this.loginUser = this.userService.getUser() || null;
    this.teamList = this.loginUser?.teams || [];
    if (this.teamList.length > 0 && !this.selectedTeamId) {
      this.selectedTeamId = this.teamList[0].team_id;
      this.refreshChannelList();
    }
  }

  refreshChannelList() {
    this.loginUser = this.userService.getUser() || null;
    this.channelList =
      this.teamList.find((t) => t.team_id === this.selectedTeamId)?.channels ||
      [];
    if (this.channelList.length > 0 && !this.selectedChannelId) {
      this.selectedChannelId = this.channelList[0].channel_id;
      this.selectChannel(this.selectedChannelId);
    }
    this.refreshConversationList();
  }

  refreshConversationList() {
    this.loginUser = this.userService.getUser() || null;
    this.conversationList =
      this.loginUser?.direct_messages.map((id) => ({
        conversationId: id,
        conversationName: '',
        messages: [],
      })) || [];
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
  }

  //////////////////////////////////////////////Open Dialogue//////////////////////////////////////////////
  openCreateTeamDialog(): void {
    if (this.loginUser?.role !== 'admin') {
      alert('You do not have the necessary permissions to create a team.');
      return;
    }
    const dialogRef = this.dialog.open(AddTeamDialogComponent, {
      data: { theme: this.isDarkTheme },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.team_id) {
        this.dialog.open(AddMemberTeamPopUpComponent, {
          data: { selectedTeam: result.team_id, theme: this.isDarkTheme },
        });
        this.refreshTeamList();
        this.selectTeam(result.team_id);
      }
    });
  }

  openCreateChannelDialog(): void {
    const dialogRef = this.dialog.open(AddChannelDialogComponent, {
      data: { selectedTeam: this.selectedTeamId, theme: this.isDarkTheme },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log('Result:', result);
      if (result && result.channel_id) {
        this.dialog.open(AddMemberChannelPopUpComponent, {
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
    this.dialog.open(AddMemberTeamPopUpComponent, {
      data: { selectedTeam: this.selectedTeamId, theme: this.isDarkTheme },
    });
  }

  openRemoveMemberTeamDialog(): void {
    this.dialog.open(RemoveMemberTeamPopUpComponent, {
      data: { selectedTeam: this.selectedTeamId, theme: this.isDarkTheme },
    });
  }

  openDeleteDialog(messageId: string, messageText: string): void {
    const dialogRef = this.dialog.open(DeleteMessageComponent, {
      data: { messageId, messageText, theme: this.isDarkTheme },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.messages = this.messages.filter((msg) => msg.messageId !== result);
      }
    });
  }

  openAddMemberChannelDialog(channel: IChannel): void {
    const dialogRef = this.dialog.open(AddMemberChannelPopUpComponent, {
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
    const dialogRef = this.dialog.open(EditChannelPopUpComponent, {
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
            (c) => c.channel_id === channel.channel_id
          );
          if (channelIndex > -1) {
            this.teamList[teamIndex].channels[channelIndex] = {
              ...this.teamList[teamIndex].channels[channelIndex],
              ...result,
            };
          }
        }
      }
    });
  }

  selectTeam(team: string): void {
    let teamMemberListID: string[] = [];
    this.teamMemberList = [];
    this.selectedTeamId = team;
    this.backendService.getTeamById(team).then((teamData) => {
      if (teamData) {
        this.channelList = teamData.channels || [];
        this.teamTitle = teamData.team_name || '';
        teamMemberListID = teamData.members || [];
      }
      teamMemberListID.forEach((member) => {
        this.backendService.getUserById(member).then((userData) => {
          if (userData) {
            this.teamMemberList.unshift(userData);
          }
        });
      });
      this.channelTitle = '';
      this.handleResize();
    });
  }

  async selectChannel(channelId: string): Promise<void> {
    console.log('Selected channel:', channelId);
    if (this.selectedTeamId) {
      const selectedChannel = await this.backendService.getChannelById(
        this.selectedTeamId,
        channelId
      );
      this.selectedChannelObject = selectedChannel || null;
      if (selectedChannel) {
        console.log('Selected conversation:', selectedChannel.conversationId);
        console.log('Selected channel:', selectedChannel);
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

  async loadMessages(conversationId: string): Promise<void> {
    const messages = await this.backendService.getMessages(conversationId);
    if (messages) {
      this.messages = messages;
    }
    this.messages.reverse();
  }

  selectConversation(conversation: string): void {
    console.log('Selected conversation:', conversation);
    // this.selectedTeam = conversation;
  }

  async sendMessage() {
    console.log('Sending message:', this.selectedChannelId);

    if (this.newMessage && this.selectedChannelObject) {
      console.log('if case');
      const sender = this.userService.getUser();
      if (sender) {
        console.log('Sending message:', this.newMessage);
        const success = await this.backendService.sendMessage(
          this.newMessage,
          this.selectedChannelObject.conversationId,
          sender.user_id
        );
        console.log('Message sent:', success);
        this.newMessage = '';
        if (success) {
          await this.loadMessages(this.selectedChannelObject.conversationId);
        }
      }
    }
  }

  async createCoversation(memberId: string) {
    const sender = this.userService.getUser();
    const receiver = await this.backendService.getUserById(memberId);
    const conversationName = `Conversation: ${sender?.username}, ${receiver?.username}`;
    console.log('Creating conversation:', conversationName);
    console.log('Sender:', sender?.user_id);
    console.log('Receiver:', receiver?.user_id);
    if (sender) {
      const conversation = await this.backendService.createConversation(
        conversationName,
        sender.user_id,
        memberId
      );
      console.log('Conversation created:', conversation);
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
    const chatBox = document.querySelector('.chat-box') as HTMLElement;
    const teamSidebar = document.querySelector(
      '.team-setting-sidebar'
    ) as HTMLElement;
    if (teamSidebar) {
      console.log('Toggle team list:', this.isTeamListOpen);
      if (this.isTeamListOpen) {
        teamSidebar.style.display = 'none';
        // chatBox.style.width = 'calc(100% - 20rem)';
        if (window.innerWidth < 600) {
            chatBox.style.width = 'calc(100% - 40rem)';
        } else {
          chatBox.style.width = 'calc(100% - 20rem)';
        }
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
}
