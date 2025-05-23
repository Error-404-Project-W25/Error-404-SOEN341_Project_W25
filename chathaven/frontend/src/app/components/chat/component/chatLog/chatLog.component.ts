import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { IUser, IMessage } from '@shared/interfaces';
import { DeleteMessageDialog } from '../../dialogue/delete-message/delete-message.dialogue';
import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
import { DataService } from '@services/data.service';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { QuickMessagesComponent } from '../../dialogue/quick-messages/quick-messages.component';

@Component({
  selector: 'chat-chat-log',
  templateUrl: './chatLog.component.html',
  styleUrls: ['./chatLog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    PickerModule,
    MatIconModule,
    QuickMessagesComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ChatLogComponent implements OnInit, OnDestroy {
  @Input() loginUser: IUser | undefined = undefined;
  showEmojiPicker = false;
  showGifPicker = false;
  set: 'apple' | 'google' | 'twitter' | 'facebook' = 'twitter';

  isDarkTheme: boolean = true;
  isTeamListOpen: boolean = false;
  quoteMessage: IMessage | null = null;
  newMessage: string = '';
  messages: IMessage[] = [];
  chatTitle: string = '';
  selectedChannelId: string = '';
  selectedTeamId: string = '';
  selectedConversationId: string = '';
  isDirectMessage: boolean = false;
  isMessageLoading: boolean = false;

  gifResults: any[] = [];
  gifSearchQuery: string = '';
  gifSelected: string = '';

  userIdToName: { [userId: string]: string } = {};
  previewData: { [url: string]: any } = {};

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    private backendService: BackendService,
    private dataService: DataService,
    private pickerModule: PickerModule,
    private http: HttpClient
  ) {
    this.dataService.currentTeamId.subscribe((teamId) => {
      this.selectedTeamId = teamId;
    });
    dataService.isDirectMessage.subscribe((isDirectMessage) => {
      this.resetAll();
      this.isDirectMessage = isDirectMessage;
      if (isDirectMessage) {
        this.handleDirectMessage();
      } else {
        this.handleChannelMessage();
      }
    });

    this.dataService.isDarkTheme.subscribe((isDarkTheme) => {
      this.isDarkTheme = isDarkTheme;
    });
    this.dataService.isInformationOpen.subscribe((isInformationOpen) => {
      this.isTeamListOpen = isInformationOpen;
    });
  }

  ngOnInit(): void {
    this.loginUser = this.userService.getUser();
    // Listen for message selection events
    this.dataService.selectedMessageId.subscribe((messageId) => {
      if (messageId) {
        this.scrollToMessage(messageId);
      }
    });

    setInterval(() => {
      this.refreshMessages();
    }, 1000);
  }

  ngOnDestroy() {}

  openDeleteDialog(messageId: string, messageText: string): void {
    const dialogRef = this.dialog.open(DeleteMessageDialog, {
      data: {
        messageId,
        messageText,
        channelId: this.selectedChannelId,
        teamId: this.selectedTeamId,
      },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result && this.selectedConversationId) {
        const success = await this.backendService.deleteMessage(
          this.selectedConversationId,
          result
        );

        if (success) {
          this.messages = this.messages.filter(
            (msg) => msg.messageId !== result
          );
        } else {
          console.error('Failed to delete message');
        }
      } else {
        console.error('No conversation ID found for deletion');
      }
    });
  }
  private scrollToBottom(): void {
    const chatLog = document.querySelector('.chat-log');
    if (chatLog) {
      chatLog.scrollTop = chatLog.scrollHeight;
    }
  }
  async loadMessages(): Promise<void> {
    if (!this.messages.length) {
      this.isMessageLoading = true;
    }

    try {
      const messages = await this.backendService.getMessages(
        this.selectedConversationId
      );
      if (messages) {
        const uniqueSenderIds = [...new Set(messages.map((msg) => msg.sender))];

        for (const userId of uniqueSenderIds) {
          if (!this.userIdToName[userId]) {
            const user = await this.backendService.getUserById(userId);
            if (user) {
              this.userIdToName[userId] = user.username;
            }
          }
        }

        this.messages = messages;
      }

      // Fetch link previews (avoid fetching duplicate URLs)
      const fetchedUrls = new Set<string>();
      for (const message of this.messages) {
        const urls = this.extractUrls(message.content);
        for (const url of urls) {
          if (
            !this.previewData[url] &&
            !url.endsWith('.gif') &&
            !fetchedUrls.has(url)
          ) {
            this.previewData[url] = await this.backendService.getUrlPreview(
              url
            ); // Use BackendService
            fetchedUrls.add(url);
          }
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      alert('Failed to load messages. Please try again.');
    }

    this.isMessageLoading = false;
    setTimeout(() => this.scrollToBottom(), 50);
  }

  async sendMessage(): Promise<void> {
    if (!this.newMessage.trim()) return;

    const sender = this.userService.getUser();

    if (!sender || !this.selectedConversationId) {
      console.error('No sender or conversation ID found');
      if (!this.selectedConversationId) alert('No conversation ID selected');
      return;
    }

    const messageContent = this.newMessage.trim();
    this.newMessage = '';

    try {
      const success = await this.backendService.sendMessage(
        messageContent,
        sender.userId,
        this.selectedConversationId,
        this.quoteMessage?.messageId
      );

      if (success) {
        const newMessage: IMessage = {
          messageId: Date.now().toString(),
          content: messageContent,
          sender: sender.userId,
          time: new Date().toISOString(),
        };

        this.messages.push(newMessage);
        this.userIdToName[sender.userId] = sender.username;

        // Fetch link previews efficiently
        const fetchedUrls = new Set<string>();
        const urls = this.extractUrls(messageContent);
        for (const url of urls) {
          if (
            !this.previewData[url] &&
            !url.endsWith('.gif') &&
            !fetchedUrls.has(url)
          ) {
            this.previewData[url] = await this.backendService.getUrlPreview(
              url
            ); // Use BackendService
            fetchedUrls.add(url);
          }
        }

        setTimeout(() => this.scrollToBottom(), 0);
        this.refreshMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }

    this.quoteMessage = null;
  }

  private async refreshMessages(): Promise<void> {
    const messages = await this.backendService.getMessages(
      this.selectedConversationId
    );
    if ((messages?.length ?? 0) === this.messages.length) {
      console.log('No new messages to refresh');
      return; // No need to refresh if the size is the same
    }
    if (messages) {
      const uniqueSenderIds = [...new Set(messages.map((msg) => msg.sender))];
      for (const userId of uniqueSenderIds) {
        if (!this.userIdToName[userId]) {
          const user = await this.backendService.getUserById(userId);
          if (user) {
            this.userIdToName[userId] = user.username;
          }
        }
      }
      this.messages = messages;
    }
    this.scrollToBottom();
  }

  // Handle quick message selection
  sendQuickMessage(message: string) {
    this.newMessage = message; // Set the message content
    this.sendMessage(); // Send the message automatically
  }

  getUserName(userId: string): string {
    return this.userIdToName[userId] || userId;
  }

  private handleDirectMessage() {
    this.chatTitle = '';
    this.dataService.currentConversationId.subscribe((conversationId) => {
      this.selectedConversationId = conversationId;
      this.backendService
        .getConversationById(this.selectedConversationId)
        .then((name) => {
          this.chatTitle = name?.conversationName || '';
        });
      this.loadMessages();
    });
  }

  private handleChannelMessage() {
    this.chatTitle = '';
    this.dataService.currentChannelId.subscribe((channel) => {
      this.selectedChannelId = channel;
      if (this.selectedChannelId) {
        this.backendService
          .getChannelById(this.selectedChannelId)
          .then((channel) => {
            this.chatTitle = channel?.name || '';
            this.selectedConversationId = channel?.conversationId || '';
            this.loadMessages();
          });
      }
    });
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
    if (this.showEmojiPicker) {
      this.showGifPicker = false; // Close GIF picker if emoji picker is opened
    }
  }

  toggleGifPicker(): void {
    this.showGifPicker = !this.showGifPicker;
    if (this.showGifPicker) {
      this.showEmojiPicker = false; // Close emoji picker if GIF picker is opened
      this.gifResults = [];
      this.searchGifs(); // Fetch trending GIFs by default
    }
  }

  async searchGifs(): Promise<void> {
    try {
      const gifs = await this.backendService.getGifs(
        this.gifSearchQuery || 'trending'
      );
      if (gifs) {
        this.gifResults = gifs.map((gif) => gif.url); // Extract GIF URLs
      }
    } catch (error) {
      console.error('Error fetching GIFs:', error);
    }
  }

  addEmoji(event: { emoji: { native: string } }): void {
    this.newMessage += event.emoji.native;
  }

  async selectGif(gifUrl: string) {
    const cleanUrl = gifUrl.split('?')[0]; // Removes everything after "?"
    this.gifSelected = cleanUrl;
    if (this.gifSelected) {
      const sender = this.userService.getUser();

      if (!sender || !this.selectedConversationId) {
        console.error('No sender or conversation ID found');
        return;
      }

      try {
        const success = await this.backendService.sendMessage(
          this.gifSelected,
          sender.userId,
          this.selectedConversationId,
          this.quoteMessage?.messageId
        );

        if (success) {
          const newMessage: IMessage = {
            messageId: Date.now().toString(),
            content: this.gifSelected,
            sender: sender.userId,
            time: new Date().toISOString(),
          };

          this.messages.push(newMessage);
          this.userIdToName[sender.userId] = sender.username;

          setTimeout(() => this.scrollToBottom(), 0);

          this.refreshMessages();
        }
      } catch (error) {
        console.error('Error sending GIF:', error);
        alert('Failed to send GIF. Please try again.');
      }
      this.gifSelected = '';
    }
  }

  quotingMessage(messageId: IMessage): void {
    this.quoteMessage = messageId;
  }

  cancelquote(): void {
    this.quoteMessage = null;
  }

  getMessageById(messageId: string): IMessage | null {
    return this.messages.find((msg) => msg.messageId === messageId) || null;
  }

  extractUrls(text: string): string[] {
    const urlPattern =
      /(?:https?:\/\/)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;
    return text.match(urlPattern) || [];
  }

  splitTextIntoSegments(
    text: string
  ): { type: 'text' | 'url'; value: string }[] {
    const urlPattern =
      /(?:https?:\/\/)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;
    let segments: { type: 'text' | 'url'; value: string }[] = [];
    let lastIndex = 0;

    text.replace(urlPattern, (match, index) => {
      // if (match.endsWith('.gif')) {
      //   // Skip GIF URLs
      //   lastIndex = index + match.length;
      //   return match;
      // }

      if (index > lastIndex) {
        segments.push({
          type: 'text',
          value: text.substring(lastIndex, index),
        });
      }
      segments.push({ type: 'url', value: match });
      lastIndex = index + match.length;
      return match;
    });

    if (lastIndex < text.length) {
      segments.push({ type: 'text', value: text.substring(lastIndex) });
    }

    return segments;
  }

  async getLinkPreviewData(url: string): Promise<any> {
    try {
      return await this.backendService.getUrlPreview(url); // Use BackendService
    } catch (error) {
      console.error('Error fetching LinkPreview data:', error);
      return null; // Return null as a fallback
    }
  }

  async previewLink(url: string): Promise<void> {
    const previewData = await this.getLinkPreviewData(url); // Use updated method
    if (previewData) {
      console.log('LinkPreview Data:', previewData);
      // Use this data to display the preview in your component
    }
  }

  resetAll() {
    this.quoteMessage = null;
    this.newMessage = '';
    this.messages = [];
    this.chatTitle = '';
    this.selectedChannelId = '';
    this.selectedTeamId = '';
    this.selectedConversationId = '';
  }
  scrollToMessage(messageId: string, maxRetries = 15): void {
    const attemptScroll = (retryCount: number) => {
      const messageElement = document.getElementById(`message-${messageId}`);
      const chatLog = document.querySelector('.chat-log');

      if (messageElement && chatLog) {
        const chatLogRect = chatLog.getBoundingClientRect();
        const messageRect = messageElement.getBoundingClientRect();
        const scrollTop =
          messageElement.offsetTop -
          chatLogRect.height / 2 +
          messageRect.height / 2;

        chatLog.scrollTop = scrollTop;

        // Add highlight class after scrolling completes
        setTimeout(() => {
          messageElement.classList.add('highlighted-message');
          setTimeout(() => {
            messageElement.classList.remove('highlighted-message');
          }, 3000);
        }, 100);
      } else if (retryCount > 0) {
        // Message not found, retry after a delay
        console.log(
          `Message element not found, retrying... (${retryCount} attempts left)`
        );
        setTimeout(() => attemptScroll(retryCount - 1), 500);
      } else {
        console.log('Failed to find message element after all retries');
      }
    };

    // Start the retry process after a small initial delay
    setTimeout(() => attemptScroll(maxRetries), 100);
  }
}
