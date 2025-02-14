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

  /*Test START*/
  teamMemberList: string[] = Array.from(
    { length: 30 },
    (_, i) => `Member ${i + 1}`
  );
  channelNameList: IChannel[] = [];
  conversationList: string[] = Array.from(
    { length: 30 },
    (_, i) => `Conversation ${i + 1}`
  );
  teamList: ITeam[] = [];
  messages: Message[] = [
    new Message('User1', '10:44 AM', 'Sounds good! Have a great weekend.'),
    new Message('User2', '10:43 AM', 'Thanks! Let’s catch up next week.'),
    new Message('User1', '10:42 AM', 'Understandable. Hope you enjoy it!'),
    new Message('User2', '10:41 AM', 'Yeah, I could use one after this week.'),
    new Message('User1', '10:40 AM', 'Nice, that sounds like a good break.'),
    new Message(
      'User2',
      '10:39 AM',
      'That sounds fun! I might just relax at home.'
    ),
    new Message(
      'User1',
      '10:38 AM',
      'Not yet, but thinking of going hiking. You?'
    ),
    new Message('User2', '10:37 AM', 'Any plans for the weekend?'),
    new Message(
      'User1',
      '10:36 AM',
      'Yeah, it’s been a hectic week for me too.'
    ),
    new Message('User2', '10:35 AM', 'Same here, been really busy with work.'),
    new Message('User1', '10:34 AM', 'Just working on some projects. You?'),
    new Message('User2', '10:33 AM', 'What have you been up to lately?'),
    new Message('User1', '10:32 AM', 'Doing great, thanks for asking!'),
    new Message('User2', '10:31 AM', "I'm good, thanks! How about you?"),
    new Message('User1', '10:30 AM', 'Hello, how are you?'),
    new Message(
      'User3',
      '10:29 AM',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit,'
    ),
  ];

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

  ngOnDestroy() {}

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
    this.channelNameList =
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
    this.selectedTeam = team;
    this.backendService.getTeamById(team).then((teamData) => {
      this.channelNameList = teamData?.channels || [];
      this.teamTitle = teamData?.team_name || '';
    });
  }

  selectChannel(channel: string): void {
    console.log('Selected channel:', channel);
    this.selectedChannel = channel;
    this.backendService.getChannelById(this.selectedTeam!, channel).then((channelData) => {
      this.channelTitle = channelData?.name || '';
    });
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
