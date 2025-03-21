import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
import { IUser, IInbox } from '@shared/interfaces';
import { DataService } from '@services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'chat-information-sidebar',
  templateUrl: './informationSideBar.component.html',
  styleUrls: ['./informationSideBar.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule],
})
export class InformationSidebarComponent implements OnInit, OnDestroy {
  @Input() userId: string = '';

  selectedTeamId: string | null = null;
  selectedChannelId: string | null = null;
  selectedConversationId: string | null = null;

  teamTitle: string = '';
  chatTitle: string = '';
  isDirectMessage: boolean = false;
  teamMemberList: IUser[] = [];
  chatMemberList: IUser[] = [];
  requestList: IInbox[] = [];
  inviteList: IInbox[] = [];

  teamDescription: string = '';
  chatDescription: string = '';
  activeTab: string = 'chat';

  private statusSubscription?: Subscription;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    private backendService: BackendService,
    private dataService: DataService
  ) {
    this.dataService.currentTeamId.subscribe(async (teamId) => {
      if (teamId) {
        this.selectedTeamId = teamId;
        try {
          const team = await this.backendService.getTeamById(teamId);
          if (team) {
            this.teamTitle = ' :' + team.teamName;
            this.teamDescription = team.description;
            this.teamMemberList = [];
            for (const memberId of team.members) {
              const user = await this.backendService.getUserById(memberId);
              if (user) {
                this.teamMemberList.push(user);
              }
            }
          }
        } catch (error) {
          console.error('Error refreshing team member list:', error);
        }
      }
    });

    this.dataService.isDirectMessage.subscribe((isDirectMessage) => {
      this.isDirectMessage = isDirectMessage;
      if (this.isDirectMessage) {
        this.handleDirectMessage();
      } else {
        this.handleChannelMessage();
      }
    });


    this.statusSubscription = this.userService.userStatus$.subscribe(async (status) => {
      const updatedUser = this.userService.getUser();
      if (updatedUser) {
        // Update status in team member list
        const teamMemberIndex = this.teamMemberList.findIndex(m => m.userId === updatedUser.userId);
        if (teamMemberIndex !== -1 && (status === 'online' || status === 'away' || status === 'offline')) {
          this.teamMemberList[teamMemberIndex].status = status as 'online' | 'away' | 'offline';
        }

        // Update status in chat member list
        const chatMemberIndex = this.chatMemberList.findIndex(m => m.userId === updatedUser.userId);
        if (chatMemberIndex !== -1 && (status === 'online' || status === 'away' || status === 'offline')) {
          this.chatMemberList[chatMemberIndex].status = status as 'online' | 'away' | 'offline';
        }
      }
    });
  }

  ngOnInit() {
    this.refreshList();
  }
  refreshList() {
    this.backendService.getUserById(this.userId).then((user) => {
      if (user) {
        const requestUserIds = new Set(this.requestList.map(req => req.userIdThatYouWantToAdd));
        const inviteUserIds = new Set(this.inviteList.map(inv => inv.userIdThatYouWantToAdd));
        requestUserIds.forEach(userId => {
          if (inviteUserIds.has(userId)) {
            const request = this.requestList.find(req => req.userIdThatYouWantToAdd === userId);
            const invite = this.inviteList.find(inv => inv.userIdThatYouWantToAdd === userId);
            if (request && invite) {
              this.acceptRequest(request);
              this.declineInvite(invite);
            }
          }
        });
        user.inbox.forEach(async (inbox) => {
          if (inbox.type === 'request') {
            this.requestList.push(inbox);
            console.log('Request list: ', this.requestList);
          } else if (inbox.type === 'invite') {
            this.inviteList.push(inbox);
            console.log('Invite List: ', this.inviteList);
          }
        });
        console.log('Request list: ', this.requestList);
        console.log('Invite List: ', this.inviteList);
      }
    });
  }

  ngOnDestroy() {
    // Add to existing ngOnDestroy
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }

  async createCoversation(memberId: string) {
    const sender = await this.backendService.getUserById(this.userId);
    const receiver = await this.backendService.getUserById(memberId);
    const conversationName = `${sender?.username}, ${receiver?.username}`;
    if (sender && receiver?.userId) {
      const conversationId = await this.backendService.createDirectMessages(
        conversationName,
        sender.userId,
        receiver.userId
      );
      this.dataService.selectTeam('');
      this.dataService.selectChannel('');
      if (conversationId) {
        this.dataService.selectConversation(conversationId.conversationId);
      }
      this.dataService.toggleIsDirectMessage(true);
      alert('Direct Messages successfully created');
    }
  }

  private handleDirectMessage() {
    this.dataService.currentConversationId.subscribe((conversationId) => {
      this.selectedConversationId = conversationId;
      this.backendService
        .getConversationById(this.selectedConversationId)
        .then((conversation) => {
          if (conversation) {
            this.chatTitle = '';
            const memberNames = conversation.conversationName
              .split(',')
              .map((name) => name.trim());
            this.chatDescription =
              'Conversation between ' + memberNames.join(', ');
            this.chatMemberList = [];
            for (const name of memberNames) {
              this.backendService.getUserByUsername(name).then((user) => {
                if (user) {
                  this.chatMemberList.push(user);
                }
              });
            }
          }
        });
    });
  }

  private handleChannelMessage() {
    this.dataService.currentChannelId.subscribe((channel) => {
      this.selectedChannelId = channel;
      if (this.selectedChannelId) {
        this.backendService
          .getChannelById(this.selectedChannelId!)
          .then((channel) => {
            if (channel) {
              this.chatTitle = ' :' + channel.name;
              this.chatDescription = channel.description;
              this.chatMemberList = [];
              for (const memberId of channel.members) {
                this.backendService.getUserById(memberId).then((user) => {
                  if (user) {
                    this.chatMemberList.push(user);
                  }
                });
              }
            }
          });
      }
    });
  }

  private async refreshTeamMemberList() {
    if (!this.selectedTeamId) return;
    
    const team = await this.backendService.getTeamById(this.selectedTeamId);
    if (team) {
      this.teamMemberList = [];
      for (const memberId of team.members) {
        const user = await this.backendService.getUserById(memberId);
        if (user) {
          this.teamMemberList.push(user);
        }
      }
    }
  }

  private async refreshChatMemberList() {
    if (this.isDirectMessage) {
      await this.handleDirectMessage();
    } else {
      await this.handleChannelMessage();
    }
  }

  private async updateMemberStatuses() {
    // Update team member statuses
    for (let i = 0; i < this.teamMemberList.length; i++) {
      const updatedUser = await this.backendService.getUserById(this.teamMemberList[i].userId);
      if (updatedUser) {
        this.teamMemberList[i].status = updatedUser.status;
      }
    }

    // Update chat member statuses  
    for (let i = 0; i < this.chatMemberList.length; i++) {
      const updatedUser = await this.backendService.getUserById(this.chatMemberList[i].userId);
      if (updatedUser) {
        this.chatMemberList[i].status = updatedUser.status;
      }
    }
  }

  changeTab(tab: string) {
    this.activeTab = tab;
  }

  acceptRequest(request: IInbox) {
    console.log('Accepting request: ', request);
    this.backendService.response(this.userId, request.inboxId, 'accept');
    this.refreshList();
  }

  declineRequest(request: IInbox) {
    console.log('Declining request:', request);
    this.backendService.response(this.userId, request.inboxId, 'decline');
    this.refreshList();
  }

  acceptInvite(invite: IInbox) {
    console.log('Accepting invite: ', invite);
    this.backendService.response(
      invite.userIdThatYouWantToAdd,
      invite.inboxId,
      'accept'
    );
    this.refreshList();
  }

  declineInvite(invite: IInbox) {
    console.log('Declining invite:', invite);
    this.backendService.response(
      invite.userIdThatYouWantToAdd,
      invite.inboxId,
      'decline'
    );
    this.refreshList();
  }
}
