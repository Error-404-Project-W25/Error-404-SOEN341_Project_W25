// filepath: c:\Users\super\OneDrive\Documents\VScodeProject\SOEN 341\Project\Error-404-SOEN341_Project_W25\chathaven\frontend\src\app\components\chat\component\chatLog\chatLog.component.ts
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
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ChatLogComponent implements OnInit, OnDestroy {
  @Input() loginUser: IUser | undefined = undefined;
  showEmojiPicker = false;
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

  userIdToName: { [userId: string]: string } = {};
  previewData: { [url: string]: any } = {};

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    private backendService: BackendService,
    private dataService: DataService,
    private pickerModule: PickerModule
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

  ngOnInit() {
    this.loginUser = this.userService.getUser();
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

  async loadMessages(): Promise<void> {
    if (!this.messages.length) {
      this.isMessageLoading = true;
    }

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

    for (const message of this.messages) {
      const urls = this.extractUrls(message.content);
      for (const url of urls) {
        if (!this.previewData[url]) {
          this.previewData[url] = await this.getOpenGraphData(url);
        }
      }
    }

    this.isMessageLoading = false;
    setTimeout(() => this.scrollToBottom(), 50);
  }

  private scrollToBottom(): void {
    const chatLog = document.querySelector('.chat-log');
    if (chatLog) {
      chatLog.scrollTop = chatLog.scrollHeight;
    }
  }

  async sendMessage() {
    if (this.newMessage) {
      const sender = this.userService.getUser();

      if (!sender || !this.selectedConversationId) {
        console.error('No sender or conversation ID found');
        if (!this.selectedConversationId) alert('No conversation ID selected');
        return;
      }

      const messageContent = this.newMessage;
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

          const urls = this.extractUrls(messageContent);
          for (const url of urls) {
            if (!this.previewData[url]) {
              this.previewData[url] = await this.getOpenGraphData(url);
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
  }

  private async refreshMessages(): Promise<void> {
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
  }

  addEmoji(event: { emoji: { native: string } }): void {
    this.newMessage += event.emoji.native;
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

  async getOpenGraphData(url: string): Promise<any> {
    try {
      // You need to sign up for an API key at https://www.opengraph.io/
      const response = await fetch(
        `https://opengraph.io/api/1.1/site/${encodeURIComponent(
          url
        )}?app_id=OPENGRAPH_API_KEY`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching OpenGraph data:', error);
      return null;
    }
  }

  async previewLink(url: string): Promise<void> {
    const ogData = await this.getOpenGraphData(url);
    if (ogData) {
      console.log('OpenGraph Data:', ogData);
      // You can now use this data to display a preview in your component
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
}
