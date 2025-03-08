import { TeamCreationDialog } from '../../dialogue/create-team/create-team.dialogue';
import { AddTeamMemberDialog } from '../../dialogue/add-member-team/add-member-team.dialogue';
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
import { IChannel, ITeam, IUser } from '@shared/interfaces';
import { UserAuthResponse } from '@shared/user-auth.types';
import { BehaviorSubject, Subscription } from 'rxjs';
import { DataService } from '@services/data.service';

@Component({
  selector: 'app-side-bar-team',
  templateUrl: './teamSideBar.component.html',
  styleUrls: [
    './../teamSideBar.component.css',
    './../../../../../assets/theme.css',
  ],
  standalone: true,
  imports: [CommonModule], // Add CommonModule to imports
})
export class TeamSidebarComponent {
  title = 'chatHaven';
  //verification
  loginUser: IUser | null = null;

  //variables
  teamList: ITeam[] = [];

  //output
  isDarkTheme = true;
  isDirectMessage = false;
  selectedTeamId: string = '';

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    private backendService: BackendService,
    private dataService: DataService
  ) {}

  // Initialize component and subscribe to user changes
  ngOnInit() {
    // Subscribe to the current team ID from the data service
    this.dataService.currentTeamId.subscribe((teamId) => {
      this.selectedTeamId = teamId;
    });
    // Get user from local storage
    // this.loginUser = this.userService.getUser() || null;
    this.userService.user$.subscribe((user) => {
      this.loginUser = user || null;
      if (!user) {
        console.error('User not found inside of the team sidebar component');
        this.router.navigate(['/login']);
      }
    });
  }

  // Clean up subscriptions or resources
  ngOnDestroy() {
    // Implementation for ngOnDestroy
  }

  // Set up the component by fetching the user's teams
  setUp() {
    this.loginUser = this.userService.getUser() || null;
    let teamListID = this.loginUser?.teams || [];
    this.teamList = [];
    teamListID.forEach(async (teamID) => {
      const team = await this.backendService.getTeamById(teamID);
      if (team) {
        this.teamList.push(team);
      }
    });
  }

  // Toggle between dark and light themes
  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
  }

  // Placeholder for selecting a direct message
  selectDirectMessage() {
    this.dataService.toggleIsDirectMessage(true);
  }

  // Select a team by its ID
  selectTeam(teamId: string): void {
    this.dataService.selectTeam(teamId);
    this.dataService.toggleIsDirectMessage(false);
  }

  // Refresh the team list by fetching updated user data
  async refreshTeamList(): Promise<void> {
    if (this.loginUser) {
      const updatedUser = await this.backendService.getUserById(
        this.loginUser.user_id
      );
      if (updatedUser) {
        this.userService.updateUser(updatedUser);
        let teamListID = updatedUser?.teams || [];
        this.teamList = [];
        teamListID.forEach(async (teamID) => {
          const team = await this.backendService.getTeamById(teamID);
          if (team) {
            this.teamList.push(team);
          }
        });
      }
    }
  }

  // Open a dialog to create a new team
  openCreateTeamDialog(): void {
    // Check if user is an admin
    if (this.loginUser?.role !== 'admin') {
      alert('You do not have the necessary permissions to create a team.');
      return;
    }
    // Open dialog to create a team
    const dialogRef = this.dialog.open(TeamCreationDialog, {
      data: { theme: this.isDarkTheme },
    });
    // After dialog is closed
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result && result.team_id) {
        if (this.loginUser) {
          const updatedUser = await this.backendService.getUserById(
            this.loginUser.user_id
          );
          if (updatedUser) {
            this.userService.updateUser(updatedUser);

            const newTeam = await this.backendService.getTeamById(
              result.team_id
            );
            if (newTeam) {
              this.teamList.push(newTeam);
            }
          }
        }

        this.dialog.open(AddTeamMemberDialog, {
          data: { selectedTeam: result.team_id, theme: this.isDarkTheme },
        });
      }
    });
  }

  // Sign out the user and navigate to the home page
  async signOut() {
    this.loginUser = null;
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
    window.location.reload();
  }
}
