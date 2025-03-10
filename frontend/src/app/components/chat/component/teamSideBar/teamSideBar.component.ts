import { TeamCreationDialog } from '../../dialogue/create-team/create-team.dialogue';
import { AddTeamMemberDialog } from '../../dialogue/add-member-team/add-member-team.dialogue';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ITeam, IUser } from '@shared/interfaces';
import { UserAuthResponse } from '@shared/user-auth.types';
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
export class TeamSidebarComponent {
  @Input() userId: string = '';

  //variables
  teamList: ITeam[] = [];
  loginUser: IUser | null = null;

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
  ) {
    this.dataService.currentTeamId.subscribe((teamId) => {
      this.selectedTeamId = teamId;
    });

    this.dataService.isDarkTheme.subscribe((isDarkTheme) => {
      this.isDarkTheme = isDarkTheme;
    });
  }

  // Initialize component and subscribe to user changes
  ngOnInit() {
    this.refreshTeamList();
  }

  // Clean up subscriptions or resources
  ngOnDestroy() {}

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
    this.teamList = []; // Clear the team list to avoid duplicates
    const user = await this.backendService.getUserById(this.userId);
    this.loginUser = user ? user : null;

    if (this.loginUser) {
      for (const teamId of this.loginUser.teams) {
        const team = await this.backendService.getTeamById(teamId);
        if (team) {
          this.teamList.push(team);
        }
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
      data: {},
    });
    // After dialog is closed
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result && result.teamId) {
        if (this.loginUser) {
          const updatedUser = await this.backendService.getUserById(
            this.loginUser.userId
          );
          if (updatedUser) {
            this.userService.updateUser(updatedUser);

            const newTeam = await this.backendService.getTeamById(
              result.teamId
            );
            if (newTeam) {
              this.teamList.push(newTeam);
            }
          }
        }

        this.dialog.open(AddTeamMemberDialog, {
          data: { selectedTeam: result.teamId },
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
    } else {
    }
    window.location.reload();
  }
}
