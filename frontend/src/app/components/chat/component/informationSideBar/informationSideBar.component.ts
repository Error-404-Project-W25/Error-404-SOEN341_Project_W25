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
import { AddTeamDialogComponent } from '../../dialogue/create-team-dialogue/add-team-dialog.component';
import { AddMemberTeamDialogueComponent } from '../../dialogue/add-member-team-dialogue/add-member-team-dialogue.component';
import { RemoveMemberTeamDialogueComponent } from '../../dialogue/remove-member-team-dialogue/remove-member-team-dialogue.component';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.css', './../../../../../assets/theme.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule],
})
export class TeamListComponent implements OnInit, OnDestroy {
  @Input() title = 'chatHaven';
  @Input() loginUser: IUser | null = null;
  @Input() isDarkTheme = true;
  @Input() teamList: ITeam[] = [];

  @Output() teamSelected = new EventEmitter<ITeam>();
  selectedTeamId: string | null = null;

  private channelsSubject = new BehaviorSubject<IChannel[]>([]);
  private teamsSubject = new BehaviorSubject<ITeam[]>([]);
  teams$ = this.teamsSubject.asObservable();
  channels$ = this.channelsSubject.asObservable();

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    private backendService: BackendService
  ) {}

  ngOnInit() {
    this.teamList = this.loginUser?.teams || [];
    this.refreshTeamList();
  }

  ngOnDestroy() {}

  refreshTeamList() {
    this.loginUser = this.userService.getUser() || null;
    this.teamList = this.loginUser?.teams || [];
    if (this.teamList.length > 0 && !this.selectedTeamId) {
      this.selectedTeamId = this.teamList[0].team_id;
      this.refreshChannelList();
    }
  }

  refreshChannelList() {
    this.loginUser = this.userService.getUser() || null;
    const channels =
      this.teamList.find((t) => t.team_id === this.selectedTeamId)?.channels ||
      [];
    this.channelsSubject.next(channels);
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
  }

  createTeam() {
    const dialogRef = this.dialog.open(AddTeamDialogComponent, {
      data: {
        theme: this.isDarkTheme,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dialog.open(AddMemberTeamDialogueComponent, {
          data: {
            team: result,
            theme: this.isDarkTheme,
          },
        });
        this.refreshTeamList();
      }
    });
  }

  selectTeam(team: ITeam): void {
    this.teamSelected.emit(team);
  }

  async signOut() {
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
  }
}
