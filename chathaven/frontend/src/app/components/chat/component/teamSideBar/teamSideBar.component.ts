import { TeamCreationDialog } from '../../dialogue/create-team/create-team.dialogue';
import { AddTeamMemberDialog } from '../../dialogue/add-member-team/add-member-team.dialogue';
import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ITeam, IUser } from '@shared/interfaces';
import { BackendService } from '@services/backend.service';
import { DataService } from '@services/data.service';
import { UserService } from '@services/user.service';
import { io } from 'socket.io-client';

@Component({
  selector: 'chat-team-sidebar',
  templateUrl: './teamSideBar.component.html',
  styleUrls: ['./teamSideBar.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class TeamSidebarComponent implements OnInit, OnDestroy {
  @Input() loginUser: IUser | undefined = undefined;
  teamList: ITeam[] = [];
  isDarkTheme = true;
  isDirectMessage = false;
  selectedTeamId: string = '';
  inviteMemberList: IUser[] = [];
  private activityTimeout: any;
  private readonly IDLE_TIMEOUT = 300000;
  currentStatus: string = 'online';
  private manuallySetAway: boolean = false;
  private manuallySetOffline: boolean = false;

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

    this.dataService.isDarkTheme.subscribe((isDarkTheme) => {
      this.isDarkTheme = isDarkTheme;
    });

    this.setupActivityMonitoring();

    window.addEventListener('beforeunload', () => {
      this.setStatus('offline', true);
    });

    window.addEventListener('online', () => {
      if (this.userService.getUser()) {
        this.setStatus('online', true);
      }
    });

    window.addEventListener('offline', () => {
      if (this.userService.getUser()) {
        this.setStatus('offline', true);
      }
    });
  }

  private setupActivityMonitoring() {
    const resetTimer = () => {
      if (this.activityTimeout) {
        clearTimeout(this.activityTimeout);
      }

      if (this.currentStatus === 'away' && !this.manuallySetAway) {
        this.setStatus('online', false);
      }

      if (
        this.currentStatus === 'online' &&
        !this.manuallySetAway &&
        !this.manuallySetOffline
      ) {
        this.activityTimeout = setTimeout(() => {
          this.setStatus('away', false);
        }, this.IDLE_TIMEOUT);
      }
    };

    ['mousemove', 'keypress', 'click', 'scroll'].forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();
  }

  async setStatus(
    status: 'online' | 'away' | 'offline',
    isManual: boolean = true
  ) {
    if (isManual) {
      this.manuallySetAway = status === 'away';
      this.manuallySetOffline = status === 'offline';
    } else if (status !== 'online') {
      this.manuallySetAway = false;
      this.manuallySetOffline = false;
    }

    this.currentStatus = status;
    const user = this.userService.getUser();
    if (user) {
      const success = await this.backendService.updateStatus(
        user.userId,
        status
      );
      if (success) {
        await this.userService.updateUserStatus(status);
      }
    }
  }

  async ngOnInit() {
    const user = this.userService.getUser();
    this.loginUser = user;
    if (user) {
      this.currentStatus = user.status;
      this.manuallySetAway = user.status === 'away';
      this.manuallySetOffline = user.status === 'offline';

      const invites = await Promise.all(
        user.inbox
          .filter((inbox) => inbox.type === 'invite')
          .map((inbox) =>
            this.backendService.getUserById(inbox.userIdThatYouWantToAdd)
          )
      );
      this.inviteMemberList = invites.filter(
        (userToAdd) => userToAdd !== null
      ) as IUser[];
    }
    this.refreshTeamList();
  }

  ngOnDestroy() {
    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout);
    }

    window.removeEventListener('beforeunload', () => {
      this.setStatus('offline', true);
    });
    window.removeEventListener('online', () => {
      this.setStatus('online', true);
    });
    window.removeEventListener('offline', () => {
      this.setStatus('offline', true);
    });
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    this.dataService.toggleDarkMode(this.isDarkTheme);
  }

  selectDirectMessage() {
    this.dataService.resetAll();
    this.dataService.toggleIsDirectMessage(true);
  }

  selectTeam(teamId: string): void {
    this.dataService.resetAll();
    this.dataService.selectTeam(teamId);
    this.dataService.toggleIsDirectMessage(false);
  }

  async refreshTeamList(): Promise<void> {
    let list: ITeam[] = [];
    this.teamList = [];
    if (await this.userService.checkIfLoggedIn()) {
      this.loginUser = this.userService.getUser();

      if (!this.loginUser) {
        return;
      }
      list = [];
      for (const teamId of this.loginUser.teams) {
        const team = await this.backendService.getTeamById(teamId);
        if (team) {
          list.push(team);
        }
      }
      this.teamList = list;
    }
  }

  // Open a dialog to create a new team
  async openCreateTeamDialog(): Promise<void> {
    // Check if user is an admin
    if (this.userService.getUser()?.role !== 'admin') {
      alert('You do not have the necessary permissions to create a team.');
      return;
    }
    const dialogRef = this.dialog.open(TeamCreationDialog, {
      data: {},
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result && result.teamId) {
        const currUser = this.userService.getUser();
        if (!currUser) {
          return;
        }

        const updatedUser = await this.backendService.getUserById(
          currUser.userId
        );
        if (updatedUser) {
          this.userService.updateUser(updatedUser);

          const newTeam = await this.backendService.getTeamById(result.teamId);
          if (newTeam) {
            this.teamList.push(newTeam);
          }
        }

        this.dialog.open(AddTeamMemberDialog, {
          data: { selectedTeam: result.teamId },
        });
      }
    });
  }

  async signOut() {
    try {
      const user = this.userService.getUser();
      if (user?.userId) {
        const socket = io('http://localhost:3000', {
          query: { userId: user.userId },
        });

        socket.emit('disconnectUser', { userId: user.userId });
        socket.disconnect();
      }

      // Clear data and navigate before logout
      this.dataService.selectTeam('');
      this.dataService.selectChannel('');
      this.dataService.selectConversation('');

      // Perform logout
      await this.userService.logout();

      // Navigate to home
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  }

  async closeAllMenus() {
    const menuToggle = document.querySelector(
      '.menu-toggle-checkbox'
    ) as HTMLInputElement;
    if (menuToggle) {
      menuToggle.checked = false;
    }

    const statusToggle = document.querySelector(
      '.status-toggle-checkbox'
    ) as HTMLInputElement;
    if (statusToggle) {
      statusToggle.checked = false;
    }
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const userMenuContainer = document.querySelector('.user-menu-container');
    const statusMenuContainer = document.querySelector(
      '.status-menu-container'
    );

    if (
      userMenuContainer &&
      !userMenuContainer.contains(event.target as Node) &&
      statusMenuContainer &&
      !statusMenuContainer.contains(event.target as Node)
    ) {
      this.closeAllMenus();
    }
  }
}
