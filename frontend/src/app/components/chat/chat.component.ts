import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
import { IChannel, ITeam, IUser } from '@shared/interfaces';
import { UserAuthResponse } from '@shared/user-auth.types';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AddChannelDialogComponent } from '../create-channel-pop-up/add-channel-dialog.component';
import { AddTeamDialogComponent } from '../create-team-pop-up/add-team-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  teams: ITeam[] = [];
  channels: IChannel[] = [];
  selectedTeam: string | null = null;
  selectedChannel: string | null = null;
  selectedTeamName = '';

  channelCreatedSubscription: Subscription | undefined;
  teamCreatedSubscription: Subscription | undefined;

  private channelsSubject = new BehaviorSubject<IChannel[]>([]);
  channels$ = this.channelsSubject.asObservable();

  private teamsSubject = new BehaviorSubject<ITeam[]>([]);
  teams$ = this.teamsSubject.asObservable();

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    private backendService: BackendService
  ) {
    this.refreshTeams();
  }

  /**
   * Subscribe to user's team (and channel) changes.
   */
  ngOnInit() {
    console.log('Chat component initialized');
    this.userService.user$.subscribe((user: IUser | undefined) => {
      if (user?.teams) {
        this.refreshTeams();
        // If there's a selected team, refresh channels
        if (this.selectedTeam) {
          this.refreshChannels();
        }
      }
    });
  }

  /**
   * Opens a dialog to create a new channel and subscribes to its creation event.
   */
  openChannelDialog(): void {
    const dialogRef = this.dialog.open(AddChannelDialogComponent, {
      data: { selectedTeam: this.selectedTeam },
    });
    this.channelCreatedSubscription =
      dialogRef.componentInstance.channelCreated.subscribe(
        (newChannel: IChannel) => {
          console.log('Channel created:', newChannel);
          // this.channels.push(newChannel);
          // this.onChannelCreated();
        }
      );
  }

  /**
   * Opens a dialog to create a new team only if the user has admin privileges.
   */
  openTeamDialog(): void {
    if (this.userService.getUser()?.role === 'admin') {
      const dialogRef = this.dialog.open(AddTeamDialogComponent);
      this.teamCreatedSubscription =
        dialogRef.componentInstance.teamCreated.subscribe((newTeam: ITeam) => {
          console.log('Team created', newTeam);
          // this.onTeamCreated();
        });
    } else {
      alert('You do not have permission to create a team');
    }
  }

  // /**
  //  * Called when a new team is created. It refreshes the teams list.
  //  */
  // onTeamCreated() {
  //   this.refreshTeams();
  // }

  // /**
  //  * Called when a new channel is created. It refreshes the channels list.
  //  */
  // onChannelCreated() {
  //   this.refreshChannels();
  // }

  /**
   * Updates the teams list from the current user data
   */
  refreshTeams() {
    const currentUser: IUser | undefined = this.userService.getUser();
    if (currentUser) {
      const teams = [...(currentUser.teams || [])];
      this.teamsSubject.next(teams);

      if (teams.length > 0 && !this.selectedTeam) {
        this.selectTeam(teams[0]);
      }
    }
  }

  /**
   * Updates the channels list based on the selected team.
   */
  async refreshChannels() {
    /*
    if (this.selectedTeam) {
      try {
        const team = await this.backendService.getTeamById(this.selectedTeam);
        
        if (!team) {
          console.log('Team not found');
          return;
        }

        const currentUser = this.userService.getUser();
        if (!currentUser) return;

        if (currentUser.role === 'admin') {
          this.channelsSubject.next(team.channels);
          console.log('Channels updated (admin):', team.channels);
        } else {
          const channels = team.channels.filter((c) =>
            c.members.includes(currentUser.user_id ?? '')
          );
          this.channelsSubject.next(channels);
          console.log('Channels updated (user):', channels);
        }
      } catch (error) {
        console.error('Error refreshing channels:', error);
      }
    }
      */
  }

  /**
   * Selects a team and updates the available channels for that team.
   */
  async selectTeam(team: ITeam) {
    this.selectedTeam = team.team_id ?? null;
    this.selectedTeamName = team.team_name;
    // Wait for channels to be refreshed before updating the subject
    await this.refreshChannels();
    console.log('You are inside the selectTeam function');
    console.log('Selected Team:', team);
  }

  /**
   * Selects a channel within the selected team.
   */
  selectChannel(channel: IChannel) {
    this.selectedChannel = channel.name;
    console.log('You are inside the selectChannel function');
    console.log('Channel:', channel);
  }

  /**
   * Logs out the current user and navigates back to the login page.
   */
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

  /**
   * Placeholder function for menu selection.
   */
  selectSetting() {
    console.log('You are inside the selectMenu function');
  }

  // Temporary data for chat messages
  // TODO: replace with actual chat messages from the backend

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

/**
 * Represents a chat message with an author, timestamp, and message text.
 */
class Message {
  constructor(
    public author: string,
    public date: string,
    public text: string
  ) {}
}
