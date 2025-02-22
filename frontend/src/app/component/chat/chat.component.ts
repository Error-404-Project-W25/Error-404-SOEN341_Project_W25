import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
import { IChannel, ITeam, IUser, IMessage } from '@shared/interfaces';
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
  isDarkTheme = true;
  newMessage: string = '';
  channelTitle: string = '';
  teamTitle: string = '';
  selectedTeamId: string | null = null;
  selectedChannelId: string | null = null;
  selectedChannelObject: IChannel | null = null;
  teamList: ITeam[] = [];
  channelList: IChannel[] = [];
  conversationList: IChannel[] = [];
  teamMemberList: IUser[] = [];
  chatMemberList: IUser[] = [];
  messages: IMessage[] = [];
  selectedMessageId: string | null = null;
  private teamCreatedSubscription: Subscription | null = null;
  private channelCreatedSubscription: Subscription | null = null;
  private channelsSubject = new BehaviorSubject<IChannel[]>([]);
  private teamsSubject = new BehaviorSubject<ITeam[]>([]);
  teams$ = this.teamsSubject.asObservable();
  channels$ = this.channelsSubject.asObservable();

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
      }else{
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
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
  }

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
    this.dialog.open(AddChannelDialogComponent, {
      data: { selectedTeam: this.selectedTeamId, theme: this.isDarkTheme },
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

  selectChannel(channel: string): void {
    this.messages = [];
    this.selectedChannelId = channel;
    this.backendService
      .getChannelById(this.selectedTeamId!, channel)
      .then((channelData) => {
        this.channelTitle = channelData?.name || '';
        const memberPromises =
          channelData?.members.map((member) =>
            this.backendService.getUserById(member)
          ) || [];
        Promise.all(memberPromises).then((users) => {
          this.chatMemberList = users.filter(
            (user) => user !== undefined
          ) as IUser[];
        });
      });
    this.handleResize();
  }

  selectConversation(conversation: string): void {
    console.log('Selected conversation:', conversation);
    // this.selectedTeam = conversation;
  }

  async loadMessages(conversationId: string): Promise<void> {
    const messages = await this.backendService.getMessages(conversationId);
    if (messages) {
      this.messages = messages;
    }
  }

  async sendMessage() {
    console.log('Sending message:', this.selectedChannelId);
    console.log('NewMessage:', this.newMessage);
    if (this.newMessage && this.selectedChannelObject) {
      console.log('if case');
      const sender = this.userService.getUser();
      if (sender) {
        console.log('Sending message:', this.newMessage);
        const success = await this.backendService.sendMessage(this.newMessage, this.selectedChannelObject.conversationId, sender.user_id);
        console.log('Message sent:', success);
        if (success) {
          await this.loadMessages(this.selectedChannelObject.conversationId);
        }
      }
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

  myConvoFunction() {
    const dropdown = document.getElementById('myDropdownConvo');
    if (dropdown) {
      dropdown.classList.toggle('channelList-show');
    }
  }

  handleResize() {
    const width = window.innerWidth;
    const sideBarOne = document.getElementById('side-bar-1');
    const sideBarTwo = document.getElementById('side-bar-2');
    const chatLog = document.getElementById('chat-box');
    const cardContainer = document.getElementById('card-container');
    const teamListSettingBar = document.getElementById('team-setting-sidebar');
    const displayStyle = (element: HTMLElement | null, style: string) => {
      if (element) element.style.display = style;
    };
    if (width <= 450) {
      displayStyle(cardContainer, 'none');
      if (this.selectedChannelId) {
        displayStyle(sideBarOne, 'none');
        displayStyle(sideBarTwo, 'none');
        displayStyle(chatLog, 'flex');
      } else {
        displayStyle(sideBarOne, 'flex');
        displayStyle(sideBarTwo, 'flex');
        displayStyle(chatLog, 'none');
      }
    } else {
      displayStyle(cardContainer, 'flex');
      displayStyle(sideBarOne, 'flex');
      displayStyle(sideBarTwo, 'flex');
      displayStyle(chatLog, 'flex');
    }
    if (width <= 1025) {
      displayStyle(teamListSettingBar, 'none');
    } else {
      displayStyle(teamListSettingBar, 'flex');
    }
  }
}

// class Message {
//   constructor(
//     public author: string,
//     public date: string,
//     public text: string,
//     public id: string = Math.random().toString(36).substr(2, 9)
//   ) {}
// }
