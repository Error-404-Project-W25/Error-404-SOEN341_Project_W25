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
    './../informationSideBar.component.css',
    './../../../../../assets/theme.css',
  ],
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule],
})
export class InformationSidebarComponent implements OnInit, OnDestroy {
  selectedTeamId: string | null = null;
  selectedChannelId: string | null = null;

  private channelsSubject = new BehaviorSubject<IChannel[]>([]);
  private teamsSubject = new BehaviorSubject<ITeam[]>([]);
  teams$ = this.teamsSubject.asObservable();
  channels$ = this.channelsSubject.asObservable();

  private subscriptions: Subscription[] = [];

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
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.dataService.currentTeamId.subscribe((teamId) => {
        this.selectedTeamId = teamId;
      })
    );
    // this.subscriptions.push(
    //   this.dataService.currentChannelId.subscribe((channelId) => {
    //     this.selectedChannelId = channelId;
    //   })
    // );
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  private unsubscribeAll() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  createCoversation(userId: string) {
    // Implementation for creating a conversation
  }
}
