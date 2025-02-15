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

    console.log('Chat component initialized');

    // Fetch user from the service
    this.loginUser = this.userService.getUser() || null;
    console.log('Logged-in user (initial):', this.loginUser);

    // If user is not already set, subscribe to userService updates
    if (!this.loginUser) {
      this.userService.user$.subscribe((user) => {
        this.loginUser = user || null;
        console.log('Logged-in user (from subscription):', this.loginUser);
        this.refreshTeamList();
      });
    }
    // console.log('Theme:', this.currentTheme);

    this.userService.user$.subscribe((user: IUser | undefined) => {
      if (user) {
        this.teamList = user.teams;
        console.log(user.teams);
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
    console.log('Theme:', this.isDarkTheme ? 'dark' : 'light');
  }

  /*Open Different Dialogue */
  openCreateTeamDialog(): void {
    console.log('Inside function create team');
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
      } else {
        console.log('No team created or team ID not returned.');
      }
    });
  }

  openCreateChannelDialog(): void {
    console.log('Inside function create channel');
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
    console.log('Inside function remove team member');
    this.dialog.open(RemoveMemberTeamPopUpComponent, {
      data: { selectedTeam: this.selectedTeamId, theme: this.isDarkTheme },
    });
  }

  /*Select Different Team, Channel, Conversation */
  selectTeam(team: string): void {
    console.log(
      'selected team:',
      this.teamList.find((t) => t.team_id === team) || 'not found'
    );
    let teamMemberListID: string[] = [];
    this.selectedTeamId = team;
    this.backendService.getTeamById(team).then((teamData) => {
      this.channelList = teamData?.channels || [];
      this.teamTitle = teamData?.team_name || '';
      teamMemberListID = teamData?.members || [];
    });
    // Fetch each user by their ID and populate the teamMemberList
    this.teamMemberList = [];
    teamMemberListID.forEach((userId) => {
      this.backendService.getUserById(userId).then((userData) => {
        if (userData) {
          this.teamMemberList.push(userData);
        }
      });
    });
    this.channelTitle = '';
    this.handleResize();
  }

  selectChannel(channel: string): void {
    this.messages = [];
    console.log('Selected channel:', channel);
    this.selectedChannel = channel;
    this.backendService
      .getChannelById(this.selectedTeamId!, channel)
      .then((channelData) => {
        this.channelTitle = channelData?.name || '';
      });
    this.handleResize();
  }

  selectConversation(conversation: string): void {
    console.log('Selected conversation:', conversation);
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
    console.log('Sending message:', this.newMessage);
    this.newMessage = '';
  }

  /*Logout */
  async signOut() {
    const response: UserAuthResponse | undefined =
      await this.backendService.logoutUser();
    if (response && !response.error) {
      console.log('Logging out from:', this.userService.getUser()?.username);
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
    console.log('Opening edit channel dialog for:', channel.name);
    const dialogRef = this.dialog.open(EditChannelPopUpComponent, {
      width: '500px',
      data: {
        name: channel.name,
        description: channel.description,
        channel_id: channel.channel_id,
        team_id: this.selectedTeamId,
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

  // Open the DeleteMessageComponent with the selected message ID: passes msg ID and text to the dialog
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

  // Toggle the delete button visibility (Optional)
  toggleDeleteButton(messageId: string): void {
    this.selectedMessageId =
      this.selectedMessageId === messageId ? null : messageId;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  openAddMemberChannelDialog(channel: IChannel): void {
    const dialogRef = this.dialog.open(AddMemberChannelPopUpComponent, {
      data: {
        channel_id: channel.channel_id,
        team_id: this.selectedTeamId,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.added) {
        console.log('Members added:', result.members);
      }
    });
  }
  // Handle window resize events
  handleResize() {
    console.log('handleResize called');
    const width = window.innerWidth;
    console.log('Window width:', width);

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
      console.log('card-container hidden');
      if (this.selectedChannel) {
        displayStyle(sideBarOne, 'none');
        displayStyle(sideBarTwo, 'none');
        displayStyle(chatLog, 'flex');
        console.log('chatLog shown');
      } else {
        displayStyle(sideBarOne, 'flex');
        displayStyle(sideBarTwo, 'flex');
        displayStyle(chatLog, 'none');
        console.log('chatLog hidden');
      }
    } else {
      displayStyle(cardContainer, 'flex');
      displayStyle(sideBarOne, 'flex');
      displayStyle(sideBarTwo, 'flex');
      displayStyle(chatLog, 'flex');
      console.log('chatLog shown');
    }

    if (width <= 1025) {
      displayStyle(teamListSettingBar, 'none');
      console.log('teamListSettingBar hidden');
    } else {
      displayStyle(teamListSettingBar, 'flex');
      console.log('teamListSettingBar shown');
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
