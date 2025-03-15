import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { IUser,IMessage } from '@shared/interfaces';
import { DeleteMessageDialog } from '../../dialogue/delete-message/delete-message.dialogue';
import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
import { DataService } from '@services/data.service';

@Component({
  selector: 'chat-chat-log',
  templateUrl: './chatLog.component.html',
  styleUrls: ['./chatLog.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule],
})
export class ChatLogComponent implements OnInit, OnDestroy {
  isTeamListOpen: boolean = false;
  newMessage: string = '';
  loginUser: IUser | null = null;
  messages: IMessage[] = [];
  chatTitle: string = '';
  selectedChannelId: string = '';
  selectedTeamId: string = '';
  conversationId: string = '';
  isDirectMessage: boolean = false;

  userIdToName: { [userId: string]: string } = {};

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    private backendService: BackendService,
    private dataService: DataService
  ) {
    this.dataService.currentTeamId.subscribe((teamId) => {
      this.selectedTeamId = teamId;
    });
    dataService.isDirectMessage.subscribe((isDirectMessage) => {
      this.chatTitle = '';
      this.conversationId = '';
      this.isDirectMessage = isDirectMessage;
      if (this.isDirectMessage) {
        this.handleDirectMessage();
      } else {
        this.handleChannelMessage();
      }
    });
  }

  ngOnInit() {
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

        if (this.conversationId) {
          console.log(
            'Deleting message:',
            result,
            'from conversation:',
            this.conversationId
          );
          const success = await this.backendService.deleteMessage(
            this.conversationId,
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
    const messages = await this.backendService.getMessages(this.conversationId);
    if (messages) {
      this.messages = messages;
      await this.loadUserNames();
    }
    this.messages.reverse();
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

      if (!sender) {
        console.error('No sender found');
        return;
      }
      if (!this.conversationId) {
        console.error('No conversation ID found');
        alert('No conversation ID selected');
        return;
      }

      console.log('Sending message:', this.newMessage);
      console.log('convo', this.conversationId);
      const success = await this.backendService.sendMessage(
        this.newMessage,
        sender.userId,
        this.conversationId
      );
      this.newMessage = '';
      if (success) {
        await this.loadMessages();
      }
    }
  }

  getUserName(userId: string): string {
    return this.userIdToName[userId] || userId;
  }

  toggInformationSidebar() {
    //Implementation for toggInformationSidebar
    console.log('Toggling Information Sidebar');
    // this.isTeamListOpen = !this.isTeamListOpen;
  }

  private handleDirectMessage() {
    console.log('Direct Message');
    this.dataService.currentConversationId.subscribe((conversationId) => {
      this.conversationId = conversationId;
      this.backendService
        .getConversationById(this.conversationId)
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
          .getChannelById(this.selectedTeamId, this.selectedChannelId)
          .then((channel) => {
            console.log('Channel:', channel);
            this.chatTitle = channel?.name || '';
            this.conversationId = channel?.conversationId || '';
            this.loadMessages();
          });
      }
    });
  }
}
