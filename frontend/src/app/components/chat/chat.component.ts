import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
import { IChannel, ITeam, IUser } from '@shared/interfaces';
import { UserAuthResponse } from '@shared/user-auth.types';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AddChannelDialogComponent } from '../create-channel-pop-up/add-channel-dialog.component';
import { AddMemberTeamPopUpComponent } from '../add-member-team-pop-up/add-member-team-pop-up.component';
import { AddTeamDialogComponent } from '../create-team-pop-up/add-team-dialog.component';
import { RemoveMemberTeamPopUpComponent } from '../remove-member-team-pop-up/remove-member-team-pop-up.component';
import { DeleteMessageComponent } from '../moderate-channel-messages/delete-message/delete-message.component';
import { EditChannelPopUpComponent } from '../edit-channel-pop-up/edit-channel-pop-up.component';
import { AddMemberChannelPopUpComponent } from '../add-member-channel-pop-up/add-member-channel-pop-up.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule], // Add FormsModule here
  templateUrl: './chat.component.html',
  styleUrls: [
    './../../../assets/theme.css',
    './chat.component.css',
    './sideBarOne.css',
    './sideBarTwo.css',
    './chatLog.css',
    './teamList.css',
  ],
})
export class ChatComponent implements OnInit, OnDestroy {
  title = 'chatHaven';
  loginUser: IUser | null = null; // current user

  isDarkTheme = true; // initial theme is light
  newMessage: string = ''; // message input

  channelTitle: string = ''; // channel title
  teamTitle: string = ''; // team title

  selectedTeamId: string | null = null; // selected team
  selectedChannel: string | null = null; // selected channel

  teamList: ITeam[] = []; // team list
  channelList: IChannel[] = []; // channel list
  conversationList: IChannel[] = []; // conversation list

  teamMemberList: IUser[] = []; // team member list
  chatMemberList: IUser[] = []; // chat member list
  messages: Message[] = []; // message list

  selectedMessageId: string | null = null; // Track selected message for delete button

  private teamCreatedSubscription: Subscription | null = null; // subscription to team creation
  private channelCreatedSubscription: Subscription | null = null; // subscription to channel creation

  private channelsSubject = new BehaviorSubject<IChannel[]>([]); // channels subject
  private teamsSubject = new BehaviorSubject<ITeam[]>([]); // teams subject

  teams$ = this.teamsSubject.asObservable(); // teams observable
  channels$ = this.channelsSubject.asObservable(); // channels observable

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    private backendService: BackendService
  ) {}

  ngOnInit() {
    window.addEventListener('resize', this.handleResize.bind(this));
    this.handleResize(); // Initial check

    // Fetch user from the service
    this.loginUser = this.userService.getUser() || null;

    // If user is not already set, subscribe to userService updates
    if (!this.loginUser) {
      this.userService.user$.subscribe((user) => {
        this.loginUser = user || null;
        this.refreshTeamList();
      });
    }
    this.userService.user$.subscribe((user: IUser | undefined) => {
      if (user) {
        this.teamList = user.teams;
      }
    });
  }

  ngOnDestroy() {
    // window.removeEventListener('resize', this.handleResize.bind(this));
  }

  /*Refresh Team and Channel List */
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

  /*Toggle Theme */
  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
  }

  /*Open Different Dialogue */
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

    // Handle the result after dialog is closed
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Temporarily remove the message with the returned ID (msg reappears when refreshed),
        // WILL BE MODIFIED ONCE BACKEND IS IMPLEMENTED
        this.messages = this.messages.filter((msg) => msg.id !== result);
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

  /*Select Different Team, Channel, Conversation */
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
    this.selectedChannel = channel;
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
    // this.selectedTeam = conversation;
  }

  /*Send Message */
  sendMessage() {
    if (!this.newMessage) return;
    this.messages.unshift(
      new Message(
        this.loginUser?.username || 'Unknown',
        new Date().toLocaleTimeString(),
        this.newMessage
      )
    );
    this.newMessage = '';
  }

  /*Logout */
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

  /*Dropdown */
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
        // Update the channel in the list
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

  //IMPLEMENT DELETE MESSAGE FUNCTIONALITY/////////////////////////////////////////////////////////////////////////////////////////////

  // Handle window resize events
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
      if (this.selectedChannel) {
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

class Message {
  constructor(
    public author: string,
    public date: string,
    public text: string,

    //TO BE CHANGED ONCE BACKEND CREATES UNIQUE ID MESSAGES
    public id: string = Math.random().toString(36).substr(2, 9) // Generate a random ID
  ) {}
}
