import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
import { IChannel, IConversation, IUser, IInbox } from '@shared/interfaces';
import { ChannelCreationDialog } from '../../dialogue/create-channel/create-channel.dialogue';
import { AddChannelMembersDialogue } from '../../dialogue/add-member-channel/add-member-channel.dialogue';
import { AddTeamMemberDialog } from '../../dialogue/add-member-team/add-member-team.dialogue';
import { EditChannelDialog } from '../../dialogue/edit-channel/edit-channel.dialogue';
import { TeamMemberRemovalDialog } from '../../dialogue/remove-member-team/remove-member-team.dialogue';
import { DataService } from '@services/data.service';
import { JoinRequestDialog } from '../../dialogue/join-request/join-request.dialogue';
import { RemoveMemberDialogComponent } from '../../dialogue/leave-channel/leave-channel.dialogue';

interface SearchFilters {
  beforeDate: string;
  afterDate: string;
  duringDate: string;
  username?: string; // Optional parameter for channel search
}

@Component({
  selector: 'chat-channel-sidebar',
  templateUrl: './channelSideBar.component.html',
  styleUrls: ['./channelSideBar.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule],
})
export class ChannelSidebarComponent implements OnInit, OnDestroy {
  selectedTeamId: string | null = null;
  isDirectMessage: boolean = false;
  teamTitle: string = '';
  loginUser: IUser | undefined = undefined;
  loginUserId: string = '';
  selectedChannelId: string | null = null;
  channelList: IChannel[] = [];
  requestList: IInbox[] = [];
  selectedDirectMessageId: string | null = null;
  directMessageList: IConversation[] = [];
  channels: IChannel[] = [];
  channelIdToLastMessage: { [channelId: string]: string } = {};
  directMessageIdToLastMessage: { [directMessageId: string]: string } = {};
  conversationId: string | null = null;
  @Output() messageSelected = new EventEmitter<string>();

  searchQuery: string = '';
  searchResults: any[] = [];
  searchDebouncer: any;
  showSearchFilters: boolean = false;
  searchFilters: SearchFilters = {
    beforeDate: '',
    afterDate: '',
    duringDate: '',
    username: '',
  };

  // Add this new property
  activeDateFilter: 'beforeDate' | 'afterDate' | 'duringDate' | null = null;

  isSearching: boolean = false;

  constructor(
    public dialog: MatDialog,
    private userService: UserService,
    private backendService: BackendService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    // Subscribe to DM mode changes
    this.dataService.isDirectMessage.subscribe((isDirectMessage) => {
      this.isDirectMessage = isDirectMessage;
      isDirectMessage
        ? this.refreshDirectMessageList()
        : this.refreshChannelList();
    });
    this.dataService.currentTeamId.subscribe((teamId) => {
      this.selectedTeamId = teamId;
    });
    this.loginUserId = this.userService.getUser()?.userId || '';
  }

  ngOnDestroy() {}

  isChannelInbox(channelId: string): boolean {
    return this.requestList.some((inbox) => inbox.channelId === channelId);
  }

  getChannelLastMessage(channelId: string): string {
    return this.channelIdToLastMessage[channelId] || ' ';
  }
  getDirectMessageLastMessage(directMessageId: string): string {
    return this.directMessageIdToLastMessage[directMessageId] || ' ';
  }

  async refreshChannelList() {
    const list: IChannel[] = [];
    this.channelList = [];
    const selectedTeam = this.selectedTeamId
      ? await this.backendService.getTeamById(this.selectedTeamId)
      : null;
    this.teamTitle = selectedTeam?.teamName || '';
    const channelListId = selectedTeam?.channels || [];

    for (const channelId of channelListId) {
      const channel = await this.backendService.getChannelById(channelId);
      if (channel) {
        list.push(channel);
        this.channelIdToLastMessage[channel.channelId] =
          (await this.getConversationLastMessage(channel.conversationId)) || '';
      }
    }
    this.channelList = list;
  }

  async refreshDirectMessageList() {
    const list: IConversation[] = [];
    this.directMessageList = [];
    const directMessageListId =
      this.userService.getUser()?.directMessages || [];

    for (const directMessageId of directMessageListId) {
      const directMessage = await this.backendService.getConversationById(
        directMessageId
      );
      if (directMessage) {
        list.push(directMessage);
        this.directMessageIdToLastMessage[directMessageId] =
          (await this.getConversationLastMessage(directMessageId)) || '';
      }
    }
    this.directMessageList = list;
    this.teamTitle = 'Direct Messages';
  }

  openCreateChannelDialog(): void {
    const dialogRef = this.dialog.open(ChannelCreationDialog, {
      data: { selectedTeam: this.selectedTeamId },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.channelId) {
        this.dialog.open(AddChannelMembersDialogue, {
          data: {
            channelId: result.channelId,
            teamId: this.selectedTeamId,
          },
        });
        this.refreshChannelList();
      }
    });
  }

  openAddMemberTeamDialog(): void {
    if (!this.selectedTeamId) {
      alert('No team selected');
      return;
    }
    this.dialog.open(AddTeamMemberDialog, {
      data: { selectedTeam: this.selectedTeamId },
    });
  }

  openRemoveMemberTeamDialog(): void {
    this.dialog.open(TeamMemberRemovalDialog, {
      data: { selectedTeam: this.selectedTeamId },
    });
  }

  openAddMemberChannelDialog(channel: IChannel): void {
    const dialogRef = this.dialog.open(AddChannelMembersDialogue, {
      data: {
        channelId: channel.channelId,
        teamId: this.selectedTeamId,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.added) {
        this.refreshChannelList();
      }
    });
  }

  openEditChannelDialog(channel: IChannel): void {
    const dialogRef = this.dialog.open(EditChannelDialog, {
      data: { channel: channel },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.edited) {
        this.refreshChannelList();
      }
    });
  }

  openLeaveChannelDialog(channel: IChannel): void {
    const dialogRef = this.dialog.open(RemoveMemberDialogComponent, {
      data: {
        channelId: channel.channelId,
        memberId: this.userService.getUser()?.userId,
      },
    });

    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.refreshChannelList();
        if (this.selectedChannelId === channel.channelId) {
          this.dataService.selectChannel('');
          this.dataService.selectConversation('');
        }
      }
    });
  }

  selectChannel(channelId: string): void {
    this.backendService.getChannelById(channelId).then(async (channel) => {
      if (
        channel &&
        channel.members.includes(this.userService.getUser()?.userId || '')
      ) {
        this.selectedChannelId = channel.channelId;

        // Preload messages before updating UI
        await this.backendService.getMessages(channel.conversationId);

        this.dataService.selectChannel(this.selectedChannelId);
        this.dataService.selectConversation(channel.conversationId);
      } else {
        // alert('You are not a member of this channel');
        this.dialog.open(JoinRequestDialog, {
          data: { channelId: channelId, teamId: this.selectedTeamId },
        });
      }
    });
  }

  selectDirectMessage(directMessageId: string): void {
    this.conversationId = directMessageId;
    this.dataService.selectConversation(directMessageId);
  }

  isChannelMember(channel: IChannel): boolean {
    return channel.members.includes(this.userService.getUser()?.userId || '');
  }

  isPrivateChannel(channel: IChannel): boolean {
    return channel.name.toLowerCase().includes('private');
  }

  handleChannelSelection(channel: IChannel): void {
    if (this.isPrivateChannel(channel) && !this.isChannelMember(channel)) {
      return;
    }
    this.selectChannel(channel.channelId);
  }

  async getConversationLastMessage(
    conversationId: string
  ): Promise<string | null> {
    try {
      const conversation = await this.backendService.getConversationById(
        conversationId
      );
      if (conversation?.messages?.length) {
        return (
          conversation.messages[conversation.messages.length - 1].content ||
          null
        );
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const searchWrapper = document.querySelector('.search-wrapper');
    const target = event.target as HTMLElement;

    if (searchWrapper && !searchWrapper.contains(target)) {
      this.showSearchFilters = false;
      this.searchResults = [];

      this.searchQuery = '';

      this.searchFilters = {
        beforeDate: '',
        afterDate: '',
        duringDate: '',
      };
      this.activeDateFilter = null;
    }
  }

  onSearch() {
    // Clear results if no search query AND no active filters AND no username
    if (
      !this.searchQuery.trim() &&
      !this.hasActiveFilters() &&
      !this.searchFilters.username?.trim()
    ) {
      this.searchResults = [];
      return;
    }

    if (this.searchDebouncer) {
      clearTimeout(this.searchDebouncer);
    }

    this.searchDebouncer = setTimeout(() => {
      this.performSearch();
    }, 300);
  }

  async performSearch() {
    try {
      this.isSearching = true;

      if (this.isDirectMessage) {
        // Direct message search (already working correctly)
        const filters = this.buildSearchFilters();
        const searchPromises = this.directMessageList.map((conversation) =>
          this.backendService
            .searchDirectMessages(
              conversation.conversationId,
              this.searchQuery.trim(),
              filters
            )
            .then((messages) =>
              messages.map((msg) => ({
                ...msg,
                conversationId: conversation.conversationId, // Add conversationId to each message
              }))
            )
        );

        const searchResults = await Promise.all(searchPromises);
        const allSearchResults = searchResults.flat();

        // Sort results by time
        this.searchResults = allSearchResults.sort(
          (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
        );

        // Add usernames to results
        const userIds = [
          ...new Set(this.searchResults.map((msg) => msg.sender)),
        ];
        const userPromises = userIds.map((id) =>
          this.backendService.getUserById(id)
        );
        const users = await Promise.all(userPromises);

        const userMap = new Map();
        users.forEach((user) => {
          if (user) userMap.set(user.userId, user.username || 'Unknown User');
        });

        this.searchResults.forEach((result) => {
          result.username = userMap.get(result.sender) || 'Unknown User';
        });
      } else {
        const filters = this.buildSearchFilters();

        const isUsernameOnlySearch =
          !this.searchQuery.trim() && filters.username;

        // Only search channels the user is a member of
        const userChannels = this.channelList.filter((channel) =>
          channel.members.includes(this.userService.getUser()?.userId || '')
        );

        console.log(`Searching across ${userChannels.length} channels`);

        if (userChannels.length === 0) {
          console.log('No channels to search in');
          this.searchResults = [];
          this.isSearching = false;
          return;
        }

        const searchPromises = userChannels.map((channel) => {
          console.log(
            `Searching channel: ${channel.name} (${channel.channelId})`
          );
          return this.backendService
            .searchChannelMessages(
              channel.channelId,
              isUsernameOnlySearch ? '' : this.searchQuery.trim(), // Don't include text search if username-only
              filters
            )
            .then((messages) => {
              console.log(
                `Found ${messages.length} messages in channel ${channel.name}`
              );
              return messages.map((msg) => ({
                ...msg,
                conversationId: channel.conversationId,
                channelId: channel.channelId,
                channelName: channel.name,
              }));
            });
        });

        const searchResults = await Promise.all(searchPromises);
        const allSearchResults = searchResults.flat();

        console.log(`Total results found: ${allSearchResults.length}`);

        this.searchResults = allSearchResults.sort(
          (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
        );

        const userIds = [
          ...new Set(this.searchResults.map((msg) => msg.sender)),
        ];
        const userPromises = userIds.map((id) =>
          this.backendService.getUserById(id)
        );
        const users = await Promise.all(userPromises);

        const userMap = new Map();
        users.forEach((user) => {
          if (user) {
            userMap.set(user.userId, user.username || 'Unknown User');
            console.log(`Mapped user ${user.userId} to ${user.username}`);
          }
        });

        this.searchResults.forEach((result) => {
          result.username = userMap.get(result.sender) || 'Unknown User';
        });
      }
    } catch (error) {
      console.error('Error searching messages:', error);
      this.searchResults = [];
    } finally {
      this.isSearching = false;
    }
  }

  private hasActiveFilters(): boolean {
    return !!(
      this.searchFilters.beforeDate ||
      this.searchFilters.afterDate ||
      this.searchFilters.duringDate ||
      this.searchFilters.username?.trim()
    );
  }

  private buildSearchFilters() {
    const filters: any = {};

    if (this.searchFilters.beforeDate) {
      filters.beforeDate = new Date(
        this.searchFilters.beforeDate
      ).toISOString();
      console.log(
        'Setting beforeDate filter:',
        this.searchFilters.beforeDate,
        '->',
        filters.beforeDate
      );
    }

    if (this.searchFilters.afterDate) {
      filters.afterDate = this.searchFilters.afterDate;
      console.log('Setting afterDate filter:', this.searchFilters.afterDate);
    }

    if (this.searchFilters.duringDate) {
      filters.duringDate = this.searchFilters.duringDate;
      console.log('Setting duringDate filter:', this.searchFilters.duringDate);
    }

    // Only add username filter if it exists and we're in channel mode
    if (
      !this.isDirectMessage &&
      this.searchFilters.username &&
      this.searchFilters.username.trim()
    ) {
      filters.username = this.searchFilters.username.trim();
      console.log('Setting username filter:', filters.username);
    }

    console.log('Sending filters to backend:', filters);
    return filters;
  }

  scrollToMessage(messageId: string, conversationId: string) {
    const selectAndHighlight = () => {
      setTimeout(() => {
        this.dataService.selectMessage(messageId);
      }, 300);
    };

    if (this.isDirectMessage) {
      this.selectDirectMessage(conversationId);
      selectAndHighlight();
    } else {
      const channel = this.channelList.find(
        (ch) => ch.conversationId === conversationId
      );

      if (channel) {
        if (
          channel.members.includes(this.userService.getUser()?.userId || '')
        ) {
          this.selectedChannelId = channel.channelId;
          this.dataService.selectChannel(this.selectedChannelId);
          this.dataService.selectConversation(conversationId);
          selectAndHighlight();
        } else {
          // User is not a member, open the join request dialog
          this.dialog.open(JoinRequestDialog, {
            data: { channelId: channel.channelId, teamId: this.selectedTeamId },
          });
        }
      }
    }

    this.searchQuery = '';
    this.searchResults = [];
    this.searchFilters = {
      beforeDate: '',
      afterDate: '',
      duringDate: '',
      username: '',
    };
    this.activeDateFilter = null;
    this.showSearchFilters = false;
  }

  highlightText(text: string): string {
    if (!this.searchQuery) return text;
    const regex = new RegExp(`(${this.searchQuery})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  onDateFilterChange(
    filterType: 'beforeDate' | 'afterDate' | 'duringDate',
    event: any
  ): void {
    if (event.target.value) {
      this.activeDateFilter = filterType;

      // Clear other filters
      if (filterType !== 'beforeDate') this.searchFilters.beforeDate = '';
      if (filterType !== 'afterDate') this.searchFilters.afterDate = '';
      if (filterType !== 'duringDate') this.searchFilters.duringDate = '';
    } else {
      // If the filter was cleared, reset the active filter
      if (this.activeDateFilter === filterType) {
        this.activeDateFilter = null;
      }
    }

    this.onSearch();
  }

  getSelectedConversationId(): string {
    if (this.isDirectMessage) {
      return this.conversationId || '';
    } else {
      let conversationId = '';
      this.dataService.currentConversationId.subscribe((id) => {
        conversationId = id || '';
      });
      return this.selectedChannelId ? conversationId : '';
    }
  }
}
