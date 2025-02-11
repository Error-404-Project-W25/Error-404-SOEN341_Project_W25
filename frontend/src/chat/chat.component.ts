import { UserService } from './../services/user.service';
import { BackendService } from './../services/backend.service';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AddTeamDialogComponent } from './create-team-pop-up/add-team-dialog.component';
import { AddChannelDialogComponent } from './create-channel-pop-up/add-channel-dialog.component';
import { AddMemberTeamPopUpComponent } from './add-member-team-pop-up/add-member-team-pop-up.component';
import { RemoveMemberTeamPopUpComponent } from './remove-member-team-pop-up/remove-member-team-pop-up.component';

import { IChannel, ITeam, IUser } from '../../../shared/interfaces';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { UserAuthResponse } from '../types/http-response.types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './chat.component.html',
  styleUrls: [
    './chat.component.css',
    './sideBarOne.css',
    './sideBarTwo.css',
    'chatLog.css',
    'teamList.css',
  ],
})
export class ChatComponent implements OnInit, OnDestroy {
  channelTitle: string = 'Channel Name';
  TeamTitle: string = 'Team Name';
  teamMemberList: string[] = Array.from(
    { length: 30 },
    (_, i) => `Member ${i + 1}`
  );
  channelNameList: string[] = Array.from(
    { length: 30 },
    (_, i) => `Channel ${i + 1}`
  );
  teamList: string[] = Array.from({ length: 30 }, (_, i) => `T${i + 1}`);
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
  selectedTeam: string | null = null;
  selectedChannel: string | null = null;
  title = 'chatHaven';

  private teamCreatedSubscription: Subscription | null = null;
  private channelCreatedSubscription: Subscription | null = null;
  private channelsSubject = new BehaviorSubject<IChannel[]>([]);
  channels$ = this.channelsSubject.asObservable();
  private teamsSubject = new BehaviorSubject<ITeam[]>([]);
  teams$ = this.teamsSubject.asObservable();

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    private backendService: BackendService
  ) {}

  ngOnInit() {}

  ngOnDestroy() {}

  openCreateTeamDialog(): void {
    console.log('Inside function create team');
    this.dialog.open(AddTeamDialogComponent);
  }

  openCreateChannelDialog(): void {
    console.log('Inside function create channel');
    this.dialog.open(AddChannelDialogComponent, {
      data: { selectedTeam: this.selectedTeam },
    });
  }

  openAddMemberTeamDialog(): void {
    console.log('Inside function add team member');
    this.dialog.open(AddMemberTeamPopUpComponent, {
      data: { selectedTeam: this.selectedTeam },
    });
  }

  openRemoveMemberTeamDialog(): void {
    console.log('Inside function add team member');
    this.dialog.open(RemoveMemberTeamPopUpComponent, {
      data: { selectedTeam: this.selectedTeam },
    });
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
}

class Message {
  constructor(
    public author: string,
    public date: string,
    public text: string
  ) {}
}
