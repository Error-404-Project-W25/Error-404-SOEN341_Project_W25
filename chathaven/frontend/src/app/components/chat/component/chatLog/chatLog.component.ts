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
  /*Emoji */

  showEmojiPicker = false;
  set: 'apple' | 'google' | 'twitter' | 'facebook' = 'twitter';

  isDarkTheme: boolean = true;
  isTeamListOpen: boolean = false;
  newMessage: string = '';
  quoteMessage: IMessage | null = null;
  loginUser: IUser | null = null;
  messages: IMessage[] = [];
  chatTitle: string = '';
  selectedChannelId: string = '';
  selectedTeamId: string = '';
  selectedConversationId: string = '';
  isDirectMessage: boolean = false;
  isMessageLoading: boolean = false;

  testMessages: IMessage | null = null;

  userIdToName: { [userId: string]: string } = {};

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
      this.chatTitle = '';
      this.selectedConversationId = '';
      this.isDirectMessage = isDirectMessage;
      if (this.isDirectMessage) {
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
    this.testMessages = {
      messageId: '1',
      content: 'This is a test message',
      sender: 'testUser',
      time: new Date().toISOString(),
    };
    // Implementation for ngOnInit
  }

  ngOnDestroy() {
    // Implementation for ngOnDestroy
  }

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
      if (result) {
        // Get the appropriate conversation ID
        // const conversationId = this.selectedChannelObject?.conversationId || this.selectedConversationId;

        if (this.selectedConversationId) {
          console.log(
            'Deleting message:',
            result,
            'from conversation:',
            this.selectedConversationId
          );
          const success = await this.backendService.deleteMessage(
            this.selectedConversationId,
            result
          );

          console.log('Delete message result:', success);

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

    this.isMessageLoading = false;
    setTimeout(() => this.scrollToBottom(), 50);
  }

  private scrollToBottom(): void {
    const chatLog = document.querySelector('.chat-log');
    if (chatLog) {
      chatLog.scrollTop = chatLog.scrollHeight;
    }
  }

  async loadUserNames(): Promise<void> {
    const uniqueSenderIds = [
      ...new Set(this.messages.map((msg) => msg.sender)),
    ];

    for (const userId of uniqueSenderIds) {
      const user = await this.backendService.getUserById(userId);
      if (user) {
        this.userIdToName[userId] = user.username;
      }
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
      // Log the data being sent
      console.log('Sending message:', {
        messageContent,
        senderId: sender.userId,
        conversationId: this.selectedConversationId,
        quoteMessageId: this.quoteMessage?.messageId,
      });

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
    console.log('Direct Message');
    this.dataService.currentConversationId.subscribe((conversationId) => {
      this.selectedConversationId = conversationId;
      this.backendService
        .getConversationById(this.selectedConversationId)
        .then((name) => {
          this.chatTitle = 'Direct Message: ' + name?.conversationName || '';
        });
      this.loadMessages();
    });
  }

  private handleChannelMessage() {
    console.log('Channel Message');
    this.dataService.currentChannelId.subscribe((channel) => {
      this.selectedChannelId = channel;
      if (this.selectedChannelId) {
        this.backendService
          .getChannelById(this.selectedChannelId)
          .then((channel) => {
            console.log('Channel:', channel);
            this.chatTitle = channel?.name || '';
            this.selectedConversationId = channel?.conversationId || '';
            this.loadMessages();
          });
      }
    });
  }

  toggleEmojiPicker() {
    console.log(this.showEmojiPicker);
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: { emoji: { native: string } }): void {
    console.log(this.newMessage);
    const { newMessage } = this;
    console.log(newMessage);
    console.log(`${event.emoji.native}`);
    const text = `${newMessage}${event.emoji.native}`;

    this.newMessage = text;
    // this.showEmojiPicker = false;
  }

  onFocus() {
    console.log('focus');
    this.showEmojiPicker = false;
  }
  onBlur() {
    console.log('onblur');
  }

  channelBack() {
    this.dataService.selectChannel('');
    this.dataService.selectConversation('');
  }

  quotingMessage(messageId: IMessage): void {
    console.log('Message ID:', messageId);
    this.quoteMessage = messageId;
  }

  cancelquote(): void {
    this.quoteMessage = null;
  }

  getMessageById(messageId: string): IMessage | null {
    return this.messages.find((msg) => msg.messageId === messageId) || null;
  }

  // Function to extract URLs from a text
  extractUrls(text: string): string[] {
    const urlPattern = /https?:\/\/[^\s]+/g;
    return text.trim().match(urlPattern) || [];
  }

  // Add this method to the component class
  public removeUrls(content: string): string {
    return content.replace(/https?:\/\/[^\s]+/g, '');
  }

  // Function to check if a string is a valid URL
  isUrl(text: string): boolean {
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' + // Optional protocol
        '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|' + // Domain name
        '(\\d{1,3}\\.){3}\\d{1,3})' + // OR IPv4 address
        '(\\:\\d+)?' + // Optional port
        '(\\/[-a-zA-Z\\d%_.~+]*)*' + // Path
        '(\\?[;&a-zA-Z\\d%_.~+=-]*)?' + // Query string
        '(\\#[-a-zA-Z\\d_]*)?$', // Fragment
      'i'
    );
    return urlPattern.test(text);
  }
}
