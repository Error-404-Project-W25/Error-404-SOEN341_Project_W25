import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
import { IUser, IInbox, IChannel, IMessage } from '@shared/interfaces';
import { DataService } from '@services/data.service';
import { Subscription } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'chat-information-sidebar',
  templateUrl: './informationSideBar.component.html',
  styleUrls: ['./informationSideBar.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
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

  private _searchQuery: string = '';
  get searchQuery(): string {
    return this._searchQuery;
  }
  set searchQuery(value: string) {
    this._searchQuery = value;
    this.onSearchQueryChange();
  }
  searchResults: IMessage[] = [];
  userIdToUserMap: { [userId: string]: string } = {};

  showCalendar: boolean = false;
  selectedDate: Date | null = null;

  commandDescriptions: { [command: string]: string } = {
    'from:': 'Filter messages by sender username. Example: "from:john_doe"',
    'has:':
      'Filter messages containing specific elements like links. Example: "has:link"',
    'before:':
      'Filter messages sent before a specific date. Example: "before:2023-01-01"',
    'during:':
      'Filter messages sent on a specific date. Example: "during:2023-01-01"',
    'after:':
      'Filter messages sent after a specific date. Example: "after:2023-01-01"',
  };

  recommendedCommands: string[] = [];

  private statusSubscription?: Subscription;

  isInputFocused: boolean = false;
  isSelectingCommand: boolean = false;

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
    const loginUser = this.userService.getUser();
    loginUser!.inbox.forEach((inbox) => {
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

  private async getAllMessages(): Promise<IMessage[]> {
    let messages: IMessage[] = [];

    if (this.isDirectMessage && this.selectedConversationId) {
      const conversation = await this.backendService.getConversationById(
        this.selectedConversationId
      );
      messages = conversation?.messages || [];
    } else if (!this.isDirectMessage && this.selectedChannelId) {
      const channel = await this.backendService.getChannelById(
        this.selectedChannelId
      );
      if (channel?.conversationId) {
        const conversation = await this.backendService.getConversationById(
          channel.conversationId
        );
        messages = conversation?.messages || [];
      }
    }

    for (const message of messages) {
      if (message.sender && !this.userIdToUserMap[message.sender]) {
        const user = await this.backendService.getUserById(message.sender);
        if (user) {
          this.userIdToUserMap[message.sender] = user.username;
        }
      }
    }

    return messages;
  }

  async searchMessages() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }

    const allMessages = await this.getAllMessages();
    const query = this.searchQuery.toLowerCase();

    const fromMatches = query.match(/from:\s*(\S+)/g) || [];
    const hasMatches = query.match(/has:\s*(\S+)/g) || [];
    const beforeMatches = query.match(/before:\s*(\S+)/g) || [];
    const duringMatches = query.match(/during:\s*(\S+)/g) || [];
    const afterMatches = query.match(/after:\s*(\S+)/g) || [];

    this.searchResults = allMessages.filter((message) => {
      const senderUsername = this.getUsernameById(
        message.sender
      )?.toLowerCase();
      const messageDate = this.normalizeDate(new Date(message.time));

      for (const fromMatch of fromMatches) {
        const fromValue = fromMatch.split(':')[1].trim();
        if (senderUsername !== fromValue.toLowerCase()) {
          return false;
        }
      }

      for (const hasMatch of hasMatches) {
        const hasValue = hasMatch.split(':')[1].trim();
        const urlPattern =
          /(?:https?:\/\/)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;
        if (hasValue === 'link' && !urlPattern.test(message.content)) {
          return false;
        }
      }

      for (const beforeMatch of beforeMatches) {
        const beforeDate = this.normalizeDate(
          new Date(beforeMatch.split(':')[1].trim())
        );
        if (messageDate >= beforeDate) {
          return false;
        }
      }

      for (const duringMatch of duringMatches) {
        const duringDate = this.normalizeDate(
          new Date(duringMatch.split(':')[1].trim())
        );
        if (messageDate.toDateString() !== duringDate.toDateString()) {
          return false;
        }
      }

      for (const afterMatch of afterMatches) {
        const afterDate = this.normalizeDate(
          new Date(afterMatch.split(':')[1].trim())
        );
        if (messageDate <= afterDate) {
          return false;
        }
      }

      if (
        !fromMatches.length &&
        !hasMatches.length &&
        !beforeMatches.length &&
        !duringMatches.length &&
        !afterMatches.length
      ) {
        return message.content.toLowerCase().includes(query);
      }

      return true;
    });
  }

  getUsernameById(userId: string): string | undefined {
    return this.userIdToUserMap[userId];
  }

  onSearchQueryChange() {
    const query = this.searchQuery.toLowerCase().trim();
    this.recommendedCommands = [];

    // Split the query into parts to handle completed and partial commands
    const queryParts = query.split(/\s+/);
    let lastPart = queryParts[queryParts.length - 1];

    // Check if the last part matches any command exactly
    const isExactCommand = Object.keys(this.commandDescriptions).some(
      (command) => lastPart.startsWith(command)
    );

    // Generate recommendations for the last part of the query
    this.recommendedCommands = Object.keys(this.commandDescriptions).filter(
      (command) =>
        command.includes(lastPart) ||
        lastPart.includes(command) ||
        isExactCommand
    );

    // Check if the query contains date-related commands and show the calendar
    if (
      (query.includes('before:') &&
        !query.match(/before:\s*\d{4}-\d{2}-\d{2}/)) ||
      (query.includes('after:') &&
        !query.match(/after:\s*\d{4}-\d{2}-\d{2}/)) ||
      (query.includes('during:') && !query.match(/during:\s*\d{4}-\d{2}-\d{2}/))
    ) {
      this.showCalendar = true;
    } else {
      this.showCalendar = false;
    }

    this.searchMessages();
  }

  private normalizeDate(date: Date): Date {
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
  }

  onDateSelected(date: Date) {
    if (!this.searchQuery.trim()) return;

    const query = this.searchQuery.toLowerCase();
    const normalizedDate = this.normalizeDate(date);
    const formattedDate = normalizedDate.toISOString().split('T')[0];

    switch (true) {
      case query.includes('before:') &&
        !query.match(/before:\s*\d{4}-\d{2}-\d{2}/):
        this.searchQuery = query.replace(
          /before:\s*\S*/,
          `before:${formattedDate}`
        );
        break;
      case query.includes('after:') &&
        !query.match(/after:\s*\d{4}-\d{2}-\d{2}/):
        this.searchQuery = query.replace(
          /after:\s*\S*/,
          `after:${formattedDate}`
        );
        break;
      case query.includes('during:') &&
        !query.match(/during:\s*\d{4}-\d{2}-\d{2}/):
        this.searchQuery = query.replace(
          /during:\s*\S*/,
          `during:${formattedDate}`
        );
        break;
      default:
        break;
    }

    this.showCalendar = false;
    this.searchMessages();
    this.selectedDate = null;
  }

  scrollToMessage(messageId: string): void {
    const messageElement = document.getElementById(`message-${messageId}`);
    const chatLog = document.querySelector('.chat-log');
    if (messageElement && chatLog) {
      const messageOffset = messageElement.offsetTop;
      chatLog.scrollTo({
        top: messageOffset - chatLog.clientHeight / 2,
        behavior: 'smooth',
      });
      messageElement.classList.add('pulse-animation');
      setTimeout(() => {
        messageElement.classList.remove('pulse-animation');
      }, 2000);
    }
  }

  delayBlur(): void {
    setTimeout(() => {
      this.isInputFocused = false;
    }, 1000);
  }

  selectedCommand(command: string): void {
    const query = this.searchQuery.toLowerCase().trim();

    // Split the query into parts to handle completed and partial commands
    const queryParts = query.split(/\s+/);

    // Replace the last part with the selected command or append it
    if (queryParts.length > 0 && queryParts[queryParts.length - 1]) {
      queryParts[queryParts.length - 1] = command;
    } else {
      queryParts.push(command);
    }

    this.searchQuery = queryParts.join(' ').trim();
    this.isInputFocused = false;
    this.onSearchQueryChange();
  }
}
