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
export class ChatComponent implements OnInit {
  currentTheme: string = '';
  channelTitle: string = 'Channel Name';
  TeamTitle: string = 'Team Name';
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
    new Message(
      'User3',
      '10:29 AM',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit,'
    ),
    new Message('User1', '10:30 AM', 'Hello, how are you?'),
    new Message('User2', '10:31 AM', "I'm good, thanks! How about you?"),
    new Message('User1', '10:32 AM', 'Doing great, thanks for asking!'),
    new Message('User2', '10:33 AM', 'What have you been up to lately?'),
    new Message('User1', '10:34 AM', 'Just working on some projects. You?'),
    new Message('User2', '10:35 AM', 'Same here, been really busy with work.'),
    new Message(
      'User1',
      '10:36 AM',
      'Yeah, it’s been a hectic week for me too.'
    ),
    new Message('User2', '10:37 AM', 'Any plans for the weekend?'),
    new Message(
      'User1',
      '10:38 AM',
      'Not yet, but thinking of going hiking. You?'
    ),
    new Message(
      'User2',
      '10:39 AM',
      'That sounds fun! I might just relax at home.'
    ),
    new Message('User1', '10:40 AM', 'Nice, that sounds like a good break.'),
    new Message('User2', '10:41 AM', 'Yeah, I could use one after this week.'),
    new Message('User1', '10:42 AM', 'Understandable. Hope you enjoy it!'),
    new Message('User2', '10:43 AM', 'Thanks! Let’s catch up next week.'),
    new Message('User1', '10:44 AM', 'Sounds good! Have a great weekend.'),
  ];
  teams: ITeam[] = [];
  channels: IChannel[] = [];
  selectedTeamId: string | null = null;
  selectedChannel: string | null = null;
  title = 'chatHaven';

  newMessage: string = '';

  private channelsSubject = new BehaviorSubject<IChannel[]>([]);
  channels$ = this.channelsSubject.asObservable();

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    private backendService: BackendService // private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.currentTheme = 'light';
    console.log('Chat component initialized');
    // console.log('Theme:', this.currentTheme);

    this.userService.user$.subscribe((user: IUser | undefined) => {
      if (user) {
        this.teamList = user.teams;
        console.log(user.teams);
      }
    });
  }

  // changeTheme(): void {
  //   this.themeService.toggleTheme();
  //   console.log('Changing theme', this.currentTheme);
  // }

  openCreateTeamDialog(): void {
    this.dialog.open(AddTeamDialogComponent);
  }

  openCreateChannelDialog(): void {
    console.log('Inside function create channel');
    this.dialog.open(AddChannelDialogComponent, {
      data: { selectedTeam: this.selectedTeamId },
    });
  }

  openAddMemberTeamDialog(): void {
    if (!this.selectedTeamId) {
      alert('No team selected');
      return;
    }
    this.dialog.open(AddMemberTeamPopUpComponent, {
      data: { selectedTeam: this.selectedTeamId },
    });
  }

  openRemoveMemberTeamDialog(): void {
    console.log('Inside function remove team member');
    this.dialog.open(RemoveMemberTeamPopUpComponent, {
      data: { selectedTeam: this.selectedTeamId },
    });
  }

  selectTeam(team: string): void {
    console.log(
      'selected team:',
      this.teamList.find((t) => t.team_id === team) || 'not found'
    );
    this.selectedTeamId = team;
    this.channelNameList =
      this.teamList.find((t) => t.team_id === team)?.channels || [];
  }

  selectChannel(channel: string): void {
    console.log('Selected channel:', channel);
    this.selectedChannel = channel;
  }

  selectConversation(conversation: string): void {
    console.log('Selected conversation:', conversation);
    // this.selectedTeam = conversation;
  }

  sendMessage() {
    console.log('Sending message:', this.newMessage);
    this.newMessage = '';
  }

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
}

class Message {
  constructor(
    public author: string,
    public date: string,
    public text: string
  ) {}
}
