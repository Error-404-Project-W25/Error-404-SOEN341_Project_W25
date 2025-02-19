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
import { WebSocketService } from '../../../services/webSocket.service';

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
  messages: Message[] = [];
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
    private backendService: BackendService,
    // private themeService: ThemeService
    private webSocketService: WebSocketService
  ) {}

  ngOnInit() {
    this.currentTheme = 'light';
    console.log('Chat component initialized');
    // console.log('Theme:', this.currentTheme);
    
    this.userService.user$.subscribe((user: IUser | undefined) => {
      if (user) {
        this.teamList = user.teams;
        console.log(user.teams)
      }

      this.webSocketService.getMessages().subscribe((message: any) => {
        console.log('Received message:', message);
        this.messages.push(new Message(message.author, message.date, message.text));
      });
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
    console.log('Inside function add team member');
    this.dialog.open(AddMemberTeamPopUpComponent, {
      data: { selectedTeam: this.selectedTeamId },
    });
  }

  openRemoveMemberTeamDialog(): void {
    console.log('Inside function add team member');
    this.dialog.open(RemoveMemberTeamPopUpComponent, {
      data: { selectedTeam: this.selectedTeamId },
    });
  }

  selectTeam(team: string): void {
    console.log("selected team:", this.teamList.find((t) => t.team_id === team) || "not found");
    this.selectedTeamId = team;
    this.channelNameList = this.teamList.find((t) => t.team_id === team)?.channels || [];
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

}

class Message {
  constructor(
    public author: string,
    public date: string,
    public text: string
  ) {}
}
