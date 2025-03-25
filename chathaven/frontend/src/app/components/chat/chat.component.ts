import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

import { UserService } from '@services/user.service';
import { DataService } from '@services/data.service';
import { IChannel, IUser } from '@shared/interfaces';

import { TeamSidebarComponent } from './component/teamSideBar/teamSideBar.component';
import { ChannelSidebarComponent } from './component/channelSideBar/channelSideBar.component';
import { ChatLogComponent } from './component/chatLog/chatLog.component';
import { InformationSidebarComponent } from './component/informationSideBar/informationSideBar.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  imports: [
    CommonModule,
    TeamSidebarComponent,
    ChannelSidebarComponent,
    ChatLogComponent,
    InformationSidebarComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ChatComponent implements OnInit, OnDestroy {
  title = 'chatHaven';
  isDarkTheme = true;
  isInformationOpen = true;
  isDirectMessage = false;
  loginUser: IUser | undefined = undefined;
  selectedConversationId: string | null = null;
  selectedTeamId: string | null = null;

  private channelsSubject = new BehaviorSubject<IChannel[]>([]);
  channels$ = this.channelsSubject.asObservable();

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    private dataService: DataService
  ) {
    this.dataService.isDarkTheme.subscribe((isDarkTheme) => {
      this.isDarkTheme = isDarkTheme;
    });
    this.dataService.currentConversationId.subscribe((conversationId) => {
      this.selectedConversationId = conversationId;
    });
    this.dataService.currentTeamId.subscribe((teamId) => {
      this.selectedTeamId = teamId;
    });
    this.dataService.isDirectMessage.subscribe((isDirectMessage) => {
      this.isDirectMessage = isDirectMessage;
    });
    this.dataService.isInformationOpen.subscribe((isInformationOpen) => {
      this.isInformationOpen = isInformationOpen;
      this.handleInformatonBar();
    });
  }

  ngOnInit() {
    window.addEventListener('resize', this.handleResize.bind(this));
    this.handleResize();

    this.userService.checkIfLoggedIn().then((isLoggedIn) => {
      if (!isLoggedIn) {
        this.router.navigate(['/login']);
      }
    });

    this.userService.user$.toPromise().then((user) => {
      this.loginUser = user;
      if (!this.loginUser) {
        console.error('User not found');
      }
    });
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  toggleInformationBar() {
    this.isInformationOpen = !this.isInformationOpen;
    this.dataService.toggleIsInformationOpen(this.isInformationOpen);
  }

  handleResize() {
    if (window.innerWidth <= 1440) {
      this.dataService.toggleIsInformationOpen(false);
    }
    this.handleInformatonBar();
  }

  handleInformatonBar() {
    const teamSidebar = document.querySelector(
      '.team-setting-sidebar'
    ) as HTMLElement;
    const emojiMartElement = document.querySelector(
      '.emoji-mart'
    ) as HTMLElement;
    if (teamSidebar && emojiMartElement) {
      teamSidebar.style.display = this.isInformationOpen ? 'flex' : 'none';
      emojiMartElement.style.right = this.isInformationOpen ? '325px' : '0';
    }
  }
}
