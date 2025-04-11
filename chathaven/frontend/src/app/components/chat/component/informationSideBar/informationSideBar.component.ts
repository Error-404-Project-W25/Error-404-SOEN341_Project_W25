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
  // Inputs
  @Input() loginUser: IUser | undefined = undefined;

  // Subscriptions
  private statusSubscription?: Subscription;

  // Selected IDs
  selectedTeamId: string | null = null;
  selectedChannelId: string | null = null;
  selectedConversationId: string | null = null;

  // Titles and Descriptions
  teamTitle: string = '';
  chatTitle: string = '';
  teamDescription: string = '';
  chatDescription: string = '';

  // Member Lists
  teamMemberList: IUser[] = [];
  chatMemberList: IUser[] = [];

  // Inbox Lists
  requestList: IInbox[] = [];
  inviteList: IInbox[] = [];

  // Search Functionality
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

  // Command Descriptions and Recommendations
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

  // Calendar and Date Selection
  showCalendar: boolean = false;
  selectedDate: Date | null = null;

  // Miscellaneous
  activeTab: string = 'chat';
  isDirectMessage: boolean = false;
  isInputFocused: boolean = false;
  isSelectingCommand: boolean = false;
  channeIdToChannelName: { [channelId: string]: string } = {};
  userIdToUserName: { [userId: string]: string } = {};

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

  // Lifecycle Hooks
  async ngOnInit() {
    this.loginUser = this.userService.getUser();
    if (!this.loginUser) {
      this.loginUser = await this.userService.user$.toPromise();
    }
    if (!this.loginUser) {
      console.error('User not found');
    }
  }

  ngOnDestroy() {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }

  // Subscriptions
  private subscribeToTeamId() {
    this.dataService.currentTeamId.subscribe(async (teamId) => {
      if (teamId) {
        this.selectedTeamId = teamId;
        await this.refreshTeamData(teamId);
      }
    });
  }

  private subscribeToDirectMessage() {
    this.dataService.isDirectMessage.subscribe((isDirectMessage) => {
      this.isDirectMessage = isDirectMessage;
      isDirectMessage
        ? this.handleDirectMessage()
        : this.handleChannelMessage();
      this.refreshList();
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

  // Data Refresh and Handling
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

  private async refreshChannelData(channelId: string | null) {
    if (channelId) {
      const channel = await this.backendService.getChannelById(channelId);
      if (channel) {
        this.chatTitle = ': ' + channel.name;
        this.chatDescription = channel.description;
        this.chatMemberList = await this.getMembersByIds(channel.members);
        this.refreshList();
      }
    }
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

  async refreshList() {
    this.requestList = [];
    this.inviteList = [];
    const isLoggedIn = await this.userService.checkIfLoggedIn();
    if (isLoggedIn) {
      this.populateInboxLists();
    }
  }

  private async populateInboxLists(): Promise<void> {
    const isLoggedIn = await this.userService.checkIfLoggedIn();
    this.requestList = [];
    if (isLoggedIn) {
      const userId = this.userService.getUser()?.userId;
      const user = await this.backendService.getUserById(userId!);
      console.log('User:', user);
      if (user) {
        this.requestList = user.inbox.filter(
          (inbox: IInbox) =>
            inbox.type === 'request' &&
            inbox.channelId === this.selectedChannelId
        );
        this.inviteList = user.inbox.filter(
          (inbox: IInbox) => inbox.type === 'invite'
        );
      } else {
        console.error('User is undefined');
      }
    }
    console.log('Request List:', this.requestList);
    console.log('Invite List:', this.inviteList);
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
    this.loadChannelName();
    this.loadUserName();
  }

  // Member and Channel Utilities
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
    console.log('Loading channel names...');
    const uniqueChannelIds = [
      ...new Set(this.inviteList.map((invite) => invite.channelId)),
    ];
    for (const channelId of uniqueChannelIds) {
      const channel = await this.backendService.getChannelById(channelId);
      if (channel) {
        this.channeIdToChannelName[channelId] = channel.name;
      }
    }
    console.log('Channel ID to Channel Name:', this.channeIdToChannelName);
  }

  async loadUserName(): Promise<void> {
    console.log('Loading channel names...');
    const uniqueUserIds = [
      ...new Set(
        this.requestList.map((request) => request.userIdThatYouWantToAdd)
      ),
    ];
    for (const userId of uniqueUserIds) {
      const user = await this.backendService.getUserById(userId);
      if (user) {
        this.userIdToUserName[userId] = user.username;
      }
    }
    console.log('Channel ID to Channel Name:', this.channeIdToChannelName);
  }

  getChannelName(channelId: string): string {
    return this.channeIdToChannelName[channelId] || channelId;
  }

  getUserName(userId: string): string {
    return this.userIdToUserName[userId] || userId;
  }

  // Direct Message and Channel Handling
  private handleDirectMessage() {
    this.dataService.currentConversationId.subscribe((conversationId) => {
      this.selectedConversationId = conversationId;
      this.refreshConversationData(conversationId);
    });
  }

  private handleChannelMessage() {
    this.dataService.currentChannelId.subscribe((channelId) => {
      this.selectedChannelId = channelId;
      this.refreshChannelData(channelId);
      this.refreshList();
    });
  }

  async createCoversation(memberId: string) {
    const sender = this.loginUser;
    const receiver = await this.backendService.getUserById(memberId);

    if (sender && receiver?.userId) {
      const conversationName = `${sender.username}, ${receiver.username}`;

      try {
        const conversation = await this.backendService.createDirectMessages(
          conversationName,
          sender.userId,
          receiver.userId
        );

        if (conversation?.conversationId) {
          this.dataService.selectTeam('');
          this.dataService.selectChannel('');
          this.dataService.selectConversation(conversation.conversationId);
          
          // Manually add new conversationId to loginUser for local refresh
          if (this.loginUser?.directMessages) {
            this.loginUser.directMessages.push(conversation.conversationId);
          }

          // Trigger refresh of Direct Message list
          this.dataService.triggerDirectMessagesRefresh();

          this.dataService.toggleIsDirectMessage(true);

          alert('Direct Message successfully created');
        } else {
          alert('Failed to create conversation');
        }
      } catch (error) {
        console.error('Error creating conversation:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        alert(`Failed to create conversation: ${errorMessage}`);
      }
    } else {
      console.error('Sender or Receiver not found');
      alert('Failed to create conversation: Sender or Receiver not found');
    }
  }

  // Inbox Actions
  acceptRequest(request: IInbox) {
    this.respondToInbox(request, 'accept');
    this.refreshChannelData(this.selectedChannelId);
    this.refreshList();
  }

  declineRequest(request: IInbox) {
    this.respondToInbox(request, 'decline');
    this.refreshList();
  }

  acceptInvite(invite: IInbox) {
    this.respondToInbox(invite, 'accept');
    this.refreshChannelData(this.selectedChannelId);
    this.refreshList();
  }

  declineInvite(invite: IInbox) {
    this.respondToInbox(invite, 'decline');
    this.refreshList();
  }

  private async respondToInbox(inbox: IInbox, response: 'accept' | 'decline') {
    const isLoggedIn = await this.userService.checkIfLoggedIn();
    if (isLoggedIn) {
      const user = this.userService.getUser();
      if (user) {
        this.backendService.response(user.userId, inbox.inboxId, response);
        this.refreshList();
      } else {
        console.error('User is undefined');
      }
    } else {
      console.error('User is not logged in');
    }
  }

  // Search Functionality
  async searchMessages() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }

    const queryParts = this.searchQuery.toLowerCase().trim().split(/\s+/);
    const parsedQuery: {
      command?: string;
      value?: string;
      content?: string;
    }[] = [];

    for (let i = 0; i < queryParts.length; i++) {
      const part = queryParts[i];
      if (
        Object.keys(this.commandDescriptions).some((command) =>
          part.startsWith(command)
        )
      ) {
        const value = queryParts[i + 1] || ''; // Get the next part as the value
        parsedQuery.push({ command: part, value });
        i++; // Skip the next part since it's already processed as a value
      } else {
        parsedQuery.push({ content: part });
      }
    }

    console.log('Parsed Query:', parsedQuery);

    const allMessages = await this.getAllMessages();

    this.searchResults = allMessages.filter((message) => {
      const senderUsername = this.getUsernameById(
        message.sender
      )?.toLowerCase();
      const messageDate = this.normalizeDate(new Date(message.time));

      for (const query of parsedQuery) {
        if (
          query.command === 'from:' &&
          senderUsername !== query.value?.toLowerCase()
        ) {
          return false;
        }

        if (query.command === 'has:' && query.value === 'link') {
          const urlPattern =
            /(?:https?:\/\/)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;
          if (!urlPattern.test(message.content)) {
            return false;
          }
        }

        if (query.command === 'before:') {
          const beforeDate = this.normalizeDate(new Date(query.value || ''));
          if (messageDate > beforeDate) {
            return false;
          }
        }

        if (query.command === 'during:') {
          const duringDate = this.normalizeDate(new Date(query.value || ''));
          if (messageDate.toDateString() !== duringDate.toDateString()) {
            return false;
          }
        }

        if (query.command === 'after:') {
          const afterDate = this.normalizeDate(new Date(query.value || ''));
          if (messageDate < afterDate) {
            return false;
          }
        }

        if (
          !query.command &&
          query.content &&
          !message.content.toLowerCase().includes(query.content)
        ) {
          return false;
        }
      }

      return true;
    });
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

  getUsernameById(userId: string): string | undefined {
    return this.userIdToUserMap[userId];
  }

  onSearchQueryChange() {
    const query = this.searchQuery.toLowerCase().trim();
    this.recommendedCommands = [];

    const queryParts = query.split(/\s+/);

    const lastPart = queryParts[queryParts.length - 1];
    const isExactCommand = Object.keys(this.commandDescriptions).some(
      (command) => lastPart.startsWith(command)
    );

    this.recommendedCommands = Object.keys(this.commandDescriptions).filter(
      (command) =>
        command.includes(lastPart) ||
        lastPart.includes(command) ||
        isExactCommand
    );

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
          /before:\s*\S*/g,
          `before: ${formattedDate}`
        );
        break;
      case query.includes('after:') &&
      !query.match(/after:\s*\d{4}-\d{2}-\d{2}/):
        this.searchQuery = query.replace(
          /after:\s*\S*/g,
          `after: ${formattedDate}`
        );
        break;
      case query.includes('during:') &&
      !query.match(/during:\s*\d{4}-\d{2}-\d{2}/):
        this.searchQuery = query.replace(
          /during:\s*\S*/g,
          `during: ${formattedDate}`
        );
        break;
      default:
        break;
    }

    this.showCalendar = false;
    this.searchMessages();
    this.selectedDate = null;
  }

  // Miscellaneous
  changeTab(tab: string) {
    this.activeTab = tab;
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

    const queryParts = query.split(/\s+/);

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