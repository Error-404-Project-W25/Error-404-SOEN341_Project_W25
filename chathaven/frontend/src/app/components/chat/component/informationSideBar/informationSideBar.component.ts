import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
import { IUser } from '@shared/interfaces';
import { DataService } from '@services/data.service';

@Component({
  selector: 'chat-information-sidebar',
  templateUrl: './informationSideBar.component.html',
  styleUrls: ['./informationSideBar.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule],
})
export class InformationSidebarComponent implements OnInit, OnDestroy {
  selectedTeamId: string | null = null;
  selectedChannelId: string | null = null;
  selectedConversationId: string | null = null;

  teamTitle: string = '';
  chatTitle: string = '';
  isDirectMessage: boolean = false;
  teamMemberList: IUser[] = [];
  chatMemberList: IUser[] = [];
  requestMemberList: IUser[] = [];

  teamDescription: string = '';
  chatDescription: string = '';
  activeTab: string = 'chat';

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    private backendService: BackendService,
    private dataService: DataService
  ) {
    this.dataService.currentTeamId.subscribe(async (teamId) => {
      if (teamId) {
        this.selectedTeamId = teamId;
        try {
          const team = await this.backendService.getTeamById(teamId);
          if (team) {
            this.teamTitle = ' :' + team.teamName;
            this.teamDescription = team.description;
            this.teamMemberList = [];
            for (const memberId of team.members) {
              const user = await this.backendService.getUserById(memberId);
              if (user) {
                this.teamMemberList.push(user);
              }
            }
          }
        } catch (error) {
          console.error('Error refreshing team member list:', error);
        }
      }
    });

    this.dataService.isDirectMessage.subscribe((isDirectMessage) => {
      this.isDirectMessage = isDirectMessage;
      if (this.isDirectMessage) {
        this.handleDirectMessage();
      } else {
        this.handleChannelMessage();
      }
    });
  }

  ngOnInit() {}

  ngOnDestroy() {}

  async createCoversation(memberId: string) {
    const sender = this.userService.getUser();
    const receiver = await this.backendService.getUserById(memberId);
    const conversationName = `${sender?.username}, ${receiver?.username}`;
    if (sender && receiver?.userId) {
      await this.backendService.createDirectMessages(
        conversationName,
        sender.userId,
        receiver.userId
      );
      alert('Direct Messages successfully created');
    }
  }

  private handleDirectMessage() {
    this.dataService.currentConversationId.subscribe((conversationId) => {
      this.selectedConversationId = conversationId;
      this.backendService
        .getConversationById(this.selectedConversationId)
        .then((conversation) => {
          if (conversation) {
            this.chatTitle = '';
            const memberNames = conversation.conversationName
              .split(',')
              .map((name) => name.trim());
            this.chatDescription =
              'Conversation between ' + memberNames.join(', ');
            this.chatMemberList = [];
            for (const name of memberNames) {
              this.backendService.getUserByUsername(name).then((user) => {
                if (user) {
                  this.chatMemberList.push(user);
                }
              });
            }
          }
        });
    });
  }

  private handleChannelMessage() {
    this.dataService.currentChannelId.subscribe((channel) => {
      this.selectedChannelId = channel;
      if (this.selectedChannelId) {
        this.backendService
          .getChannelById(this.selectedTeamId!, this.selectedChannelId!)
          .then((channel) => {
            if (channel) {
              this.chatTitle = ' :' + channel.name;
              this.chatDescription = channel.description;
              this.chatMemberList = [];
              for (const memberId of channel.members) {
                this.backendService.getUserById(memberId).then((user) => {
                  if (user) {
                    this.chatMemberList.push(user);
                  }
                });
              }
            }
          });
      }
    });
  }

  changeTab(tab: string) {
    this.activeTab = tab;
  }

  acceptRequest(userId: string) {
    console.log('Accepting request from:', userId);
  }

  declineRequest(userId: string) {
    console.log('Declining request from:', userId);
  }
}
