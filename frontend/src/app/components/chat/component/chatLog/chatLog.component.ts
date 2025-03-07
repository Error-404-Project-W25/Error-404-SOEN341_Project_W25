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
import { DeleteMessageComponent } from '../../dialogue/delete-message-dialogue/delete-message-dialogue.component';

@Component({
  selector: 'app-chat-log',
  templateUrl: './chat-log.component.html',
  styleUrls: ['./chat-log.component.css', './../../../../../assets/theme.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule],
})
export class ChatLogComponent implements OnInit, OnDestroy {
  @Input() title = 'chatHaven';
  @Input() loginUser: IUser | null = null;
  @Input() isDarkTheme = true;
  @Input() selectedChannel: IChannel | null = null;
  @Input() messages: Message[] = [];
  @Input() selectedTeam: ITeam[] = [];

  private channelsSubject = new BehaviorSubject<IChannel[]>([]);
  private teamsSubject = new BehaviorSubject<ITeam[]>([]);
  teams$ = this.teamsSubject.asObservable();
  channels$ = this.channelsSubject.asObservable();

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    private backendService: BackendService
  ) {}

  ngOnInit() {
    this.refreshMessages();
  }

  ngOnDestroy() {}

  refreshMessages() {
    // if (this.selectedChannel) {
    //   this.backendService
    //     .getMessagesByChannelId(this.selectedTeam, this.selectedChannel.channel_id)
    //     .then((messages) => {
    //       this.messages = messages;
    //     });
    // }
  }

  openDeleteDialog(messageId: string, messageText: string): void {
    const dialogRef = this.dialog.open(DeleteMessageComponent, {
      data: { messageId, messageText, theme: this.isDarkTheme },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.messages = this.messages.filter((msg) => msg.id !== result);
      }
    });
  }

  sendMessage(newMessage: string) {
    if (!newMessage) return;
    this.messages.unshift(
      new Message(
        this.loginUser?.username || 'Unknown',
        new Date().toLocaleTimeString(),
        newMessage
      )
    );
  }

  async signOut() {
    const response: UserAuthResponse | undefined =
      await this.backendService.logoutUser();
    if (response && !response.error) {
      this.userService.clearUser();
      this.router.navigate(['/']);
    } else if (response) {
      console.error(response.error);
    } else {
      console.error('No response from backend');
    }
  }
}

class Message {
  constructor(
    public author: string,
    public date: string,
    public text: string,
    public id: string = Math.random().toString(36).substr(2, 9)
  ) {}
}
