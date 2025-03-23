import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
import { IUser, IInbox, IChannel } from '@shared/interfaces';
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
  @Input() loginUser: IUser | undefined = undefined;

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

  channeIdToChannelName: { [channelId: string]: string } = {};

  private statusSubscription?: Subscription;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    private backendService: BackendService,
    private dataService: DataService
  ) {
    this.subscribeToTeamId();
    this.subscribeToDirectMessage();
    this.subscribeToUserStatus();
  }

  private subscribeToTeamId() {
    this.dataService.currentTeamId.subscribe(async (teamId) => {
      if (teamId) {
        this.selectedTeamId = teamId;
        await this.refreshTeamData(teamId);
      }
    });
  }

  private async refreshTeamData(teamId: string) {
    try {
      const team = await this.backendService.getTeamById(teamId);
      if (team) {
        this.teamTitle = ': ' + team.teamName;
        this.teamDescription = team.description;
        this.teamMemberList = await this.getMembersByIds(team.members);
      }
    } catch (error) {
      console.error('Error refreshing team member list:', error);
    }
  }

  private async getMembersByIds(memberIds: string[]): Promise<IUser[]> {
    const members: IUser[] = [];
    for (const memberId of memberIds) {
      const user = await this.backendService.getUserById(memberId);
      if (user) {
        members.push(user);
      }
    }
    return members;
  }

  private subscribeToDirectMessage() {
    this.dataService.isDirectMessage.subscribe((isDirectMessage) => {
      this.isDirectMessage = isDirectMessage;
      isDirectMessage
        ? this.handleDirectMessage()
        : this.handleChannelMessage();
    });
  }

  private subscribeToUserStatus() {
    this.statusSubscription = this.userService.userStatus$.subscribe(
      async (status) => {
        const updatedUser = this.userService.getUser();
        if (updatedUser) {
          this.updateMemberStatus(this.teamMemberList, updatedUser, status);
          this.updateMemberStatus(this.chatMemberList, updatedUser, status);
        }
      }
    );
  }

  private updateMemberStatus(
    memberList: IUser[],
    updatedUser: IUser,
    status: string
  ) {
    const memberIndex = memberList.findIndex(
      (m) => m.userId === updatedUser.userId
    );
    if (memberIndex !== -1) {
      memberList[memberIndex].status = status as 'online' | 'away' | 'offline';
      memberList[memberIndex].lastSeen = updatedUser.lastSeen;
    }
  }

  async loadChannelName(): Promise<void> {
    const uniqueChannelIds = [
      ...new Set(this.inviteList.map((invite) => invite.channelId)),
    ];
    for (const channelId of uniqueChannelIds) {
      const channel = await this.backendService.getChannelById(channelId);
      if (channel) {
        this.channeIdToChannelName[channelId] = channel.name;
      }
    }
  }

  ngOnInit() {
    this.userService.user$.toPromise().then((user) => {
      this.loginUser = user;
      if (!this.loginUser) {
        console.error('User not found');
      }
    });
    this.refreshList();
  }

  refreshList() {
    this.requestList = [];
    this.inviteList = [];
    if (this.loginUser) {
      this.populateInboxLists();
      this.loadChannelName();
    }
  }

  private populateInboxLists() {
    this.loginUser!.inbox.forEach((inbox) => {
      if (inbox.type === 'request') {
        this.requestList.push(inbox);
      } else if (inbox.type === 'invite') {
        this.inviteList.push(inbox);
      }
    });
    this.handleDuplicateRequestsAndInvites();
  }

  private handleDuplicateRequestsAndInvites() {
    const requestUserIds = new Set(
      this.requestList.map((req) => req.userIdThatYouWantToAdd)
    );
    const inviteUserIds = new Set(
      this.inviteList.map((inv) => inv.userIdThatYouWantToAdd)
    );
    requestUserIds.forEach((userId) => {
      if (inviteUserIds.has(userId)) {
        const request = this.requestList.find(
          (req) => req.userIdThatYouWantToAdd === userId
        );
        const invite = this.inviteList.find(
          (inv) => inv.userIdThatYouWantToAdd === userId
        );
        if (request && invite) {
          this.acceptRequest(request);
          this.declineInvite(invite);
        }
      }
    });
  }

  getChannelName(channelId: string): string {
    return this.channeIdToChannelName[channelId] || channelId;
  }

  ngOnDestroy() {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }

  async createCoversation(memberId: string) {
    const sender = this.loginUser;
    const receiver = await this.backendService.getUserById(memberId);
    if (sender && receiver?.userId) {
      const conversationName = `${sender.username}, ${receiver.username}`;
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
      this.refreshConversationData(conversationId);
    });
  }

  private async refreshConversationData(conversationId: string | null) {
    if (conversationId) {
      const conversation = await this.backendService.getConversationById(
        conversationId
      );
      if (conversation) {
        this.chatTitle = '';
        const memberNames = conversation.conversationName
          .split(',')
          .map((name) => name.trim());
        this.chatDescription = 'Conversation between ' + memberNames.join(', ');
        this.chatMemberList = await this.getMembersByUsernames(memberNames);
      }
    }
  }

  private async getMembersByUsernames(usernames: string[]): Promise<IUser[]> {
    const members: IUser[] = [];
    for (const username of usernames) {
      const user = await this.backendService.getUserByUsername(username);
      if (user) {
        members.push(user);
      }
    }
    return members;
  }

  private handleChannelMessage() {
    this.dataService.currentChannelId.subscribe((channelId) => {
      this.selectedChannelId = channelId;
      this.refreshChannelData(channelId);
    });
  }

  private async refreshChannelData(channelId: string | null) {
    if (channelId) {
      const channel = await this.backendService.getChannelById(channelId);
      if (channel) {
        this.chatTitle = ': ' + channel.name;
        this.chatDescription = channel.description;
        this.chatMemberList = await this.getMembersByIds(channel.members);
      }
    }
  }

  changeTab(tab: string) {
    this.activeTab = tab;
  }

  acceptRequest(request: IInbox) {
    this.respondToInbox(request, 'accept');
  }

  declineRequest(request: IInbox) {
    this.respondToInbox(request, 'decline');
  }

  acceptInvite(invite: IInbox) {
    this.respondToInbox(invite, 'accept');
  }

  declineInvite(invite: IInbox) {
    this.respondToInbox(invite, 'decline');
  }

  private respondToInbox(inbox: IInbox, response: 'accept' | 'decline') {
    if (this.loginUser?.userId) {
      this.backendService.response(
        this.loginUser.userId,
        inbox.inboxId,
        response
      );
      this.refreshList();
    } else {
      console.error('User ID is undefined');
    }
  }
}
