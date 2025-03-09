import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
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
import { TeamCreationDialog } from '../../dialogue/create-team/create-team.dialogue';
import { AddTeamMemberDialog } from '../../dialogue/add-member-team/add-member-team.dialogue';
import { DataService } from '@services/data.service';

@Component({
  selector: 'chat-information-sidebar',
  templateUrl: './informationSideBar.component.html',
  styleUrls: [
    './informationSideBar.component.css',
    './../../../../../assets/theme.css',
  ],
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule],
})
export class InformationSidebarComponent implements OnInit, OnDestroy {
  selectedTeamId: string | null = null;
  selectedChannelId: string | null = null;

  teamTitle: string = '';
  isDirectMessage: boolean = false;
  teamMemberList: IUser[] = [];
  chatMemberList: IUser[] = [];

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
      if (isDirectMessage) {
        this.teamMemberList = [];
        this.dataService.currentConversationId.subscribe(
          async (conversationId) => {
            if (conversationId !== '') {
              try {
                const conversation =
                  await this.backendService.getConversationById(conversationId);
                if (conversation) {
                  const conversationName = conversation.conversationName;
                  if (conversationName.includes(',')) {
                    const memberName = conversationName
                      .split(',')
                      .map((name) => name.trim());
                    this.chatMemberList = [];
                    for (const name of memberName) {
                      const user = await this.backendService.getUserByUsername(
                        name
                      );
                      if (user) {
                        this.chatMemberList.push(user);
                      }
                    }
                  }
                }
              } catch (error) {
                console.error(
                  'Error refreshing conversation member list:',
                  error
                );
              }
            }
          }
        );
      } else {
        this.dataService.currentChannelId.subscribe(async (channelId) => {
          if (channelId !== '') {
            try {
              const channel = await this.backendService.getChannelById(
                this.selectedTeamId!,
                channelId
              );
              if (channel) {
                this.chatMemberList = [];
                for (const memberId of channel.members) {
                  const user = await this.backendService.getUserById(memberId);
                  if (user) {
                    this.chatMemberList.push(user);
                  }
                }
              }
            } catch (error) {
              console.error('Error refreshing channel member list:', error);
            }
          }
        });
      }
    });
  }

  ngOnInit() {}

  ngOnDestroy() {}

  async createCoversation(memberId: string) {
    const sender = this.userService.getUser();
    const receiver = await this.backendService.getUserById(memberId);
    const conversationName = `${sender?.username}, ${receiver?.username}`;
    if (sender && receiver?.user_id) {
      await this.backendService.createDirectMessages(
        conversationName,
        sender.user_id,
        receiver.user_id
      );
    }
  }
}
