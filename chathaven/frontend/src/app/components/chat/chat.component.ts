import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  CUSTOM_ELEMENTS_SCHEMA,
  Output,
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
    CommonModule, // Add CommonModule to imports
    TeamSidebarComponent,
    ChannelSidebarComponent,
    ChatLogComponent,
    InformationSidebarComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ChatComponent implements OnInit, OnDestroy {
  title = 'chatHaven';
  @Output() userId!: string;

  isDarkTheme = true;
  isInformationOpen = true;
  isDirectMessage = false;

  selectedConversationId: string | null = null;
  selectedTeamId: string | null = null;

  private channelsSubject = new BehaviorSubject<IChannel[]>([]);
  channels$ = this.channelsSubject.asObservable();

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    private dataService: DataService,
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
    // Add event listener for window resize
    window.addEventListener('resize', this.handleResize.bind(this));
    this.handleResize();

    this.userService.checkIfLoggedIn().then((isLoggedIn) => {
      if (!isLoggedIn) {
        this.router.navigate(['/login']);
      }
    });

    this.userService.user$.subscribe((user) => {
      if (user) {
        this.userId = user.userId;
      }
    });
  }

  ngOnDestroy() {
    // Remove event listener for window resize
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  toggleInformationBar() {
    this.isInformationOpen = !this.isInformationOpen;
    this.dataService.toggleIsInformationOpen(this.isInformationOpen);
  }

  /*
   * Handles the resize event for the window.
   * Adjusts the visibility of the team sidebar and the width of the chat box
   * based on the window width.
   */
  handleResize() {
    if (window.innerWidth > 1135) {
    } else {
      console.log('window.innerWidth:', window.innerWidth);
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
    if (teamSidebar) {
      console.log('isTeamListOpen:', this.isInformationOpen);
      if (this.isInformationOpen) {
        teamSidebar.style.display = 'flex';
        emojiMartElement.style.right = '325px';
      } else {
        teamSidebar.style.display = 'none';
        emojiMartElement.style.right = '0';
      }
    }
  }
}
