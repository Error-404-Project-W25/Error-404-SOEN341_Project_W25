import { loginUser } from './../../../../../backend/src/controllers/usersController';
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

  isDarkTheme = false; // initial theme is light
  newMessage: string = ''; // message input

  channelTitle: string = ''; // channel title
  teamTitle: string = ''; // team title

  selectedTeam: string | null = null; // selected team
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

  }

  /*Refresh Team and Channel List */
  refreshTeamList() {
    this.loginUser = this.userService.getUser() || null;
    this.teamList = this.loginUser?.teams || [];
    if (this.teamList.length > 0 && !this.selectedTeam) {
      this.selectedTeam = this.teamList[0].team_id;
      this.refreshChannelList();
    }
  }

  refreshChannelList() {
    this.loginUser = this.userService.getUser() || null;
    this.channelList =
      this.teamList.find((t) => t.team_id === this.selectedTeam)?.channels ||
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
    this.dialog.open(AddTeamDialogComponent, {
      data: { theme: this.isDarkTheme },
    });
  }

  openCreateChannelDialog(): void {
    console.log('Inside function create channel');
    this.dialog.open(AddChannelDialogComponent, {
      data: { selectedTeam: this.selectedTeam, theme: this.isDarkTheme },
    });
  }

  openAddMemberTeamDialog(): void {
    console.log('Inside function add team member');
    this.dialog.open(AddMemberTeamPopUpComponent, {
      data: { selectedTeam: this.selectedTeam, theme: this.isDarkTheme },
    });
  }

  openRemoveMemberTeamDialog(): void {
    console.log('Inside function add team member');
    this.dialog.open(RemoveMemberTeamPopUpComponent, {
      data: { selectedTeam: this.selectedTeam, theme: this.isDarkTheme },
    });
  }

  /*Select Different Team, Channel, Conversation */
  selectTeam(team: string): void {
    console.log(
      'selected team:',
      this.teamList.find((t) => t.team_id === team) || 'not found'
    );
    let teamMemberListID: string[] = [];
    this.selectedTeam = team;
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
  }

  selectChannel(channel: string): void {
    console.log('Selected channel:', channel);
    this.selectedChannel = channel;
    this.backendService
      .getChannelById(this.selectedTeam!, channel)
      .then((channelData) => {
        this.channelTitle = channelData?.name || '';
      });

    /*Faking message */
    const channelId = this.selectedChannel;
    if (!channelId) return;

    const fileName = `XML/${channelId}.xml`;
    fetch(fileName)
      .then((response) => response.text())
      .then((xmlString) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
      const messages = Array.from(xmlDoc.getElementsByTagName('message')).map(
        (msg) => new Message(
        msg.getElementsByTagName('author')[0].textContent || '',
        msg.getElementsByTagName('date')[0].textContent || '',
        msg.getElementsByTagName('text')[0].textContent || '',
        msg.getElementsByTagName('id')[0].textContent || ''
        )
      );
      this.messages = messages;
      })
      .catch((error) => console.error('Error fetching messages:', error));
  }

  selectConversation(conversation: string): void {
    console.log('Selected conversation:', conversation);
    // this.selectedTeam = conversation;
  }

  /*Send Message */
  sendMessage() {
    if (!this.newMessage) return;
    this.messages.unshift(
      new Message('User1', new Date().toLocaleTimeString(), this.newMessage)
    );
    console.log('Sending message:', this.newMessage);
    this.newMessage = '';
    // Faking Message
    const channelId = this.selectedChannel;
    if (!channelId) return;

    const messagesXml = this.messages
      .map(
      (msg) => `
      <message>
        <id>${msg.id}</id>
        <author>${msg.author}</author>
        <date>${msg.date}</date>
        <text>${msg.text}</text>
      </message>`
      )
      .join('');

    const xmlContent = `<channel id="${channelId}">${messagesXml}</channel>`;

    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `XML/${channelId}.xml`;
    a.click();
    URL.revokeObjectURL(url);
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
class Channel {
  constructor(
    public id: string,
    public name: string,
    public teamId: string,
    public messages: Message[] = []
  ) {}
}
class Team {
  constructor(
    public team_id: string,
    public team_name: string,
    public channels: Channel[] = [],
    public conversation: Channel[] = []
  ) {}
}
class User {
  constructor(
    public id: string,
    public username: string,
    public email: string,
    public teams: Team[] = []
  ) {}
}
