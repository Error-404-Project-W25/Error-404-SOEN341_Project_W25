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
  itle = 'chatHaven';
  @Output() userId!: string;

  loginUser: IUser | null = null;

  isDarkTheme = true;
  isTeamListOpen = true;
  isDirectMessage = false;

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
  }

  ngOnInit() {
    // Add event listener for window resize
    window.addEventListener('resize', this.handleResize.bind(this));
    this.handleResize();
    // Get user from local storage
    // this.loginUser = this.userService.getUser() || null;
    console.log('inside chat component');
    this.userService.user$.subscribe((user) => {
      this.loginUser = user || null;
      if (!user) {
        this.router.navigate(['/home']);
      } else {
        console.log('User:', user);
        console.log('User ID:', user.userId);
        this.userId = user.userId;
      }
    });
  }

  ngOnDestroy() {
    // Remove event listener for window resize
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
  }

  /*
   * Handles the resize event for the window.
   * Adjusts the visibility of the team sidebar and the width of the chat box
   * based on the window width.
   */
  handleResize() {
    // const chatBox = document.querySelector('.chat-box') as HTMLElement;
    // const teamSidebar = document.querySelector(
    //   '.team-setting-sidebar'
    // ) as HTMLElement;
    // if (window.innerWidth < 1135) {
    //   this.isTeamListOpen = true;
    // } else {
    //   this.isTeamListOpen = false;
    // }
    // if (teamSidebar) {
    //   if (this.isTeamListOpen) {
    //     teamSidebar.style.display = 'none';
    //     chatBox.style.width = 'calc(100% - 20rem)';
    //   } else {
    //     teamSidebar.style.display = 'flex';
    //     chatBox.style.width = 'calc(100% - 40rem)';
    //   }
    // }
  }
}
