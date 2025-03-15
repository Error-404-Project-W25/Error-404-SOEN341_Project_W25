import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BackendService } from '@services/backend.service';
import { DataService } from '@services/data.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-join-request',
  templateUrl: './join-request.dialogue.html',
  styleUrls: ['./join-request.dialogue.css', '../../../../../assets/theme.css'],
})
export class JoinRequestDialog {
  isDarkTheme: boolean = false; // Dark theme by default
  selectedTeamId: string = ''; // Selected team ID
  selectedChannelId: string = ''; // Selected channel ID
  channelTitle: string = ''; // Channel title

  constructor(
    public dialogRef: MatDialogRef<JoinRequestDialog>, // Dialog reference
    @Inject(MAT_DIALOG_DATA)
    public data: {
      channelId: string;
    }, // Injected data (message info)
    private userService: UserService,
    private backendService: BackendService,
    private dataService: DataService
  ) {
    this.dataService.currentTeamId.subscribe((teamId) => {
      this.selectedTeamId = teamId;
    });
    this.selectedChannelId = this.data.channelId; // Set the selected channel ID
    this.dataService.isDarkTheme.subscribe((theme) => {
      this.isDarkTheme = theme; // Set the theme based on the injected data
    });
    this.backendService
      .getChannelById(this.selectedTeamId, this.selectedChannelId)
      .then((channel) => {
        if (channel) {
          this.channelTitle = channel.name; // Set the channel title
        }
      });
  }

  // Close the dialog without performing any action (Cancel)
  onCancel() {
    console.log('Cancel');
    this.dialogRef.close();
  }

  // Confirm deletion, close the dialog, and pass the message ID back for removal
  onConfirm() {
    console.log('Confirm');
    const user = this.userService.getUser(); // Get the current user ID
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
