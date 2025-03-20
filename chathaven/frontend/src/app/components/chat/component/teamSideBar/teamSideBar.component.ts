import { TeamCreationDialog } from '../../dialogue/create-team/create-team.dialogue';
import { AddTeamMemberDialog } from '../../dialogue/add-member-team/add-member-team.dialogue';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ITeam, IUser } from '@shared/interfaces';
import { BackendService } from '@services/backend.service';
import { DataService } from '@services/data.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'chat-team-sidebar',
  templateUrl: './teamSideBar.component.html',
  styleUrls: ['./teamSideBar.component.css'],
  standalone: true,
  imports: [CommonModule], // Add CommonModule to imports
})
export class TeamSidebarComponent implements OnInit, OnDestroy {
  //variables
  teamList: ITeam[] = [];

  //output
  isDarkTheme = true;
  isDirectMessage = false;
  selectedTeamId: string = '';
  inviteMemberList: IUser[] = [];
  private activityTimeout: any;
  private readonly IDLE_TIMEOUT = 300000; // 5 minutes in milliseconds for time out
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
  }

  private setupActivityMonitoring() {
    const resetTimer = () => {
      if (this.activityTimeout) {
        clearTimeout(this.activityTimeout);
      }

      // Only change to online if current status is automatically set to away
      if (this.currentStatus === 'away' && !this.manuallySetAway) {
        this.setStatus('online');
      }

      this.activityTimeout = setTimeout(() => {
        // Only set to away if user is online and not manually set to away/offline
        if (this.currentStatus === 'online' && !this.manuallySetAway && !this.manuallySetOffline) {
          this.setStatus('away', false); // Automatically set to away
        }
      }, this.IDLE_TIMEOUT);
    };

    ['mousemove', 'keypress', 'click', 'scroll'].forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();
  }

  async setStatus(status: 'online' | 'away' | 'offline', isManual: boolean = true) {
    // Update manual flags
    if (isManual) {
      this.manuallySetAway = (status === 'away');
      this.manuallySetOffline = (status === 'offline');
    } else {
      // If it's an automatic change to away
      this.manuallySetAway = false;
      this.manuallySetOffline = false;
    }
    
    this.currentStatus = status;
    const user = this.userService.getUser();
    if (user) {
      const success = await this.backendService.updateStatus(user.userId, status);
      if (success) {
        await this.userService.updateUserStatus(status);
      }
    }
  }

  // Initialize component and subscribe to user changes
  async ngOnInit() {
    const user = this.userService.getUser();
    if (user) {
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

  // Clean up subscriptions or resources
  ngOnDestroy() {
    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout);
    }
    // Set offline status when component is destroyed
    this.setStatus('offline', true);
  }

  // Toggle between dark and light themes
  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    this.dataService.toggleDarkMode(this.isDarkTheme);
  }

  // Placeholder for selecting a direct message
  selectDirectMessage() {
    this.dataService.selectChannel('');
    this.dataService.toggleIsDirectMessage(true);
  }

  // Select a team by its ID
  selectTeam(teamId: string): void {
    this.dataService.selectTeam(teamId);
    this.dataService.toggleIsDirectMessage(false);
  }

  // Refresh the team list by fetching updated user data
  async refreshTeamList(): Promise<void> {
    const list: ITeam[] = [];
    this.teamList = []; // Clear the team list to avoid duplicates
    if (await this.userService.checkIfLoggedIn()) {
      const currUserId = this.userService.getUser()!.userId;

      const updatedUser: IUser | undefined =
        await this.backendService.getUserById(currUserId);

      if (!updatedUser) {
        return;
      }

      for (const teamId of updatedUser.teams) {
        const team = await this.backendService.getTeamById(teamId);
        if (team) {
          list.push(team);
        }
      }
      this.teamList = list;
    }
  }

  // Open a dialog to create a new team
  openCreateTeamDialog(): void {
    // Check if user is an admin
    if (this.userService.getUser()?.role !== 'admin') {
      alert('You do not have the necessary permissions to create a team.');
      return;
    }
    // Open dialog to create a team
    const dialogRef = this.dialog.open(TeamCreationDialog, {
      data: {},
    });
    // After dialog is closed
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

  // Sign out the user and navigate to the home page
  signOut() {
    this.userService.logout();
    this.router.navigate(['/home']);
  }

  async closeAllMenus() {
    // Clear the main menu checkbox
    const menuToggle = document.querySelector('.menu-toggle-checkbox') as HTMLInputElement;
    if (menuToggle) {
      menuToggle.checked = false;
    }

    // Clear the status menu checkbox
    const statusToggle = document.querySelector('.status-toggle-checkbox') as HTMLInputElement;
    if (statusToggle) {
      statusToggle.checked = false;
    }
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    // Don't close if clicking within the menu containers
    const userMenuContainer = document.querySelector('.user-menu-container');
    const statusMenuContainer = document.querySelector('.status-menu-container');
    
    if (userMenuContainer && !userMenuContainer.contains(event.target as Node) &&
        statusMenuContainer && !statusMenuContainer.contains(event.target as Node)) {
      this.closeAllMenus();
    }
  }
}
