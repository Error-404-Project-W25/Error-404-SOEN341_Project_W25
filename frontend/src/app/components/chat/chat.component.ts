import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
//import { WebSocketService } from '@services/webSocket.service';
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
    private backendService: BackendService // private webSocketService: WebSocketService
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
        this.refreshTeamList();
      } else {
        console.log('No user');
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  async refreshTeamList(): Promise<void> {
    // Skip this refresh if flag is set
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
              break; // Exit the loop once the user is found in the members list
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

  //////////////////////////////////////////////Open Dialogue//////////////////////////////////////////////
  openCreateTeamDialog(): void {
    if (this.loginUser?.role !== 'admin') {
      alert('You do not have the necessary permissions to create a team.');
      return;
    }
    const dialogRef = this.dialog.open(AddTeamDialogComponent, {
      data: { theme: this.isDarkTheme },
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result && result.team_id) {
        if (this.loginUser) {
          // Set flag to skip next team refresh
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

        this.dialog.open(AddMemberTeamPopUpComponent, {
          data: { selectedTeam: result.team_id, theme: this.isDarkTheme },
        });
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
      data: { messageId, messageText, theme: this.isDarkTheme, channelId: this.selectedChannelId, teamId: this.selectedTeamId },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        // Get the appropriate conversation ID
        const conversationId = this.selectedChannelObject?.conversationId || this.selectedConversationId;

        if (conversationId) {
          console.log('Deleting message:', result, 'from conversation:', conversationId);
          const success = await this.backendService.deleteMessage(conversationId, result);

          console.log('Delete message result:', success);

          if (success) {
            this.messages = this.messages.filter((msg) => msg.messageId !== result);
          } else {
            console.error('Failed to delete message');
          }
        } else {
          console.error('No conversation ID found for deletion');
        }
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

  async selectConversationId(conversationId: string): Promise<void> {
    this.selectedChannelObject = null;
    console.log('selectedChannelObject = :', this.selectedChannelObject);
    console.log('Selected conversation:', conversationId);
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
    console.log('Selected conversation:', conversationObject);
    this.channelTitle = conversationObject.conversationName;
    this.selectedConversationId = conversationObject.conversationId;
    this.selectedChannelObject = null;
    await this.loadMessages(conversationObject.conversationId);
  }

  async sendMessage() {
    if (this.newMessage) {
      if (this.selectedChannelObject) {
        const sender = this.userService.getUser();
        if (sender) {
          console.log('Sending message inside of channel:', this.newMessage);
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
      }else if (this.selectedConversationId) {
        const sender = this.userService.getUser();
        if (sender) {
          console.log('Sending message inside of conversation:', this.newMessage);
          const success = await this.backendService.sendMessage(
            this.newMessage,
            this.selectedConversationId,
            sender.user_id
          );
          console.log('Message sent:', success);
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
    console.log('Creating conversation:', conversationName);
    console.log('Sender:', sender?.user_id);
    console.log('Receiver:', receiver?.user_id);
    if (sender && receiver?.user_id) {
      const conversation = await this.backendService.createDirectMessages(
        conversationName,
        sender.user_id,
        receiver.user_id
      );
      console.log('Conversation created:', conversation);
    }
    alert ('Conversation created');
    console.log('Conversation created');
    console.log('Sender:', sender);
    console.log('Receiver:', receiver);
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
