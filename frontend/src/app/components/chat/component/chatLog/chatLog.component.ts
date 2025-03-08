import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
import { IChannel, ITeam, IUser } from '@shared/interfaces';
import { UserAuthResponse } from '@shared/user-auth.types';
import { BehaviorSubject, Subscription } from 'rxjs';
import { DeleteMessageDialog } from '../../dialogue/delete-message/delete-message.dialogue';

@Component({
  selector: 'app-chat-log',
  templateUrl: './chatLog.component.html',
  styleUrls: [
    './../chatLog.component.css',
    './../../../../../assets/theme.css',
  ],
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule],
})
export class ChatLogComponent implements OnInit, OnDestroy {
  private channelsSubject = new BehaviorSubject<IChannel[]>([]);
  private teamsSubject = new BehaviorSubject<ITeam[]>([]);
  teams$ = this.teamsSubject.asObservable();
  channels$ = this.channelsSubject.asObservable();
  isTeamListOpen: boolean = false;
  newMessage: string = '';
  loginUser: IUser | null = null;
  messages: any[] = [];
  channelTitle: string = '';

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    private backendService: BackendService
  ) {}

  ngOnInit() {
    // Implementation for ngOnInit
  }

  ngOnDestroy() {
    // Implementation for ngOnDestroy
  }

  refreshMessages() {
    // Implementation for refreshMessages
  }

  openDeleteDialog(messageId: string, messageText: string): void {
    // Implementation for openDeleteDialog
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      // Implementation for sendMessage
      const message = {
        sender: this.loginUser?.user_id,
        content: this.newMessage,
        time: new Date(),
      };
      this.messages.push(message);
      this.newMessage = '';
    }
  }

  toggleTeamList() {
    this.isTeamListOpen = !this.isTeamListOpen;
  }

  getUserName(userId: string): string {
    // return this.userService.getUserNameById(userId);
    return '';
  }
}
