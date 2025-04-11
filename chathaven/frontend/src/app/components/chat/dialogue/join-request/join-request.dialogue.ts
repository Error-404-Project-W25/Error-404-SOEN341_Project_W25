import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BackendService } from '@services/backend.service';
import { DataService } from '@services/data.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-join-request',
  templateUrl: './join-request.dialogue.html',
  styleUrls: ['./join-request.dialogue.css', '../../../../../assets/theme.css'],
})
export class JoinRequestDialog implements OnInit {
  isDarkTheme: boolean = false;
  selectedTeamId: string = '';
  selectedChannelId: string = '';
  channelTitle: string = '';

  constructor(
    public dialogRef: MatDialogRef<JoinRequestDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: { channelId: string },
    private userService: UserService,
    private backendService: BackendService,
    private dataService: DataService
  ) {
    this.selectedChannelId = this.data.channelId;

    this.dataService.currentTeamId.subscribe((teamId) => {
      this.selectedTeamId = teamId;
    });

    this.dataService.isDarkTheme.subscribe((theme) => {
      this.isDarkTheme = theme;
    });
  }

  async ngOnInit() {
    try {
      const channel = await this.backendService.getChannelById(
        this.selectedChannelId
      );
      if (channel) {
        this.channelTitle = channel.name;
      }
    } catch (error) {
      console.error('Error fetching channel:', error);
    }
  }

  onCancel() {
    console.log('Cancel');
    this.dialogRef.close();
  }

  onConfirm() {
    console.log('Confirm');
    const user = this.userService.getUser();
    if (user?.userId) {
      this.backendService.requestToJoin(
        'request',
        user.userId,
        this.selectedChannelId
      );
    } else {
      console.error('User ID is undefined');
    }
    this.dialogRef.close(this.data.channelId);
  }
}
