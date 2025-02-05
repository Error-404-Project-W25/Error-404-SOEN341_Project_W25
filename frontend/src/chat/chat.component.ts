import { UserService } from './../services/user.service';
import { BackendService } from './../services/backend.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddChannelDialogComponent } from './create-channel-pop-up/add-channel-dialog.component';
import { AddTeamDialogComponent } from './create-team-pop-up/add-team-dialog.component';
import { IChannel, ITeam, IUser } from '../../../shared/interfaces';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})

export class ChatComponent implements OnInit, OnDestroy {
  currentUser: IUser | null = null;
  teams: ITeam[] = [];
  channels: IChannel[] = [];
  selectedTeam: string | null = null;
  selectedChannel: string | null = null;
  teamSelectedName = '';
  title = 'chatHaven';

  private teamCreatedSubscription: Subscription | null = null;
  private channelCreatedSubscription: Subscription | null = null;

  /*private teamsSubject = new BehaviorSubject<ITeam[]>([]);
  teams$ = this.teamsSubject.asObservable();
  */


  private channelsSubject = new BehaviorSubject<IChannel[]>([]);
  channels$ = this.channelsSubject.asObservable();

  teams$: Observable<ITeam[]>;

  constructor(
    public dialog: MatDialog,
    private userService: UserService,
    private backendService: BackendService
  ) {
    this.currentUser = this.userService.getUser();
    this.teams$ = this.userService.teams$;
  }


  ngOnInit() {
    this.teams$.subscribe(teams => {
      if (teams.length > 0 && !this.selectedTeam) {
        this.selectTeam(teams[0]); 
      }
    });
  }

  ngOnDestroy() {
    this.teamCreatedSubscription?.unsubscribe();
    this.channelCreatedSubscription?.unsubscribe();
  }

  openChannelDialog(): void {
    const dialogRef = this.dialog.open(AddChannelDialogComponent);
    this.channelCreatedSubscription =
      dialogRef.componentInstance.channelCreated.subscribe(() => {
        this.onChannelCreated();
      });
  }

  openTeamDialog(): void {
    if (this.currentUser?.role === 'admin') {
      const dialogRef = this.dialog.open(AddTeamDialogComponent);
      
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('New team added:', result);
          this.onTeamCreated();  // Update the teams list
        }
      });
    } else {
      console.error('Permission denied: Only admins can create a team.');
      alert('You do not have permission to create a team.');
    }
  }

  onTeamCreated() {
    console.log('Team created, performing necessary actions...');
    if (this.currentUser) {
      this.userService.updateUserTeams(this.currentUser.user_id);
    }
  }

  onChannelCreated() {
    console.log('Channel created, performing necessary actions...');
    this.refreshChannels(); // Call the function to refresh channels array
  }

  refreshChannels() {
    if (this.selectedTeam) {
      this.teams$.subscribe(teams => {
        const team = teams.find((t) => t.team_id === this.selectedTeam);
        if (team) {
          this.channelsSubject.next(team.channels);
          console.log('Channels updated:', team.channels);
        }
      });
    }
  }

  selectTeam(team: ITeam) {
    this.selectedTeam = team.team_id ?? null;
    this.teamSelectedName = team.team_name;
    this.channelsSubject.next(team.channels);
    console.log('You are inside the selectTeam function');
    console.log('Selected Team:', team);
  }
  

  selectChannel(channel: IChannel) {
    this.selectedChannel = channel.name;
    console.log('You are inside the selectChannel function');
    console.log('Channel:', channel);
  }

  selectSetting() {
    this.backendService.logoutUser();
    console.log('Logging out from:', this.currentUser?.username);
    window.location.href = '/';
  }

  selectMenu() {
    console.log('You are inside the selectMenu function');
  }

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
}

class Message {
  constructor(
    public author: string,
    public date: string,
    public text: string
  ) {}
}
