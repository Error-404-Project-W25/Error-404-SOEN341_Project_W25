import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BackendService } from '@services/backend.service';
import { DataService } from '@services/data.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-delete-message',
  templateUrl: './delete-message.dialogue.html',
  styleUrls: ['./delete-message.dialogue.css'],
})
export class DeleteMessageDialog implements OnInit {
  isDarkTheme: boolean = false;
  isCreator: boolean = false;
  selectedTeamId: string = '';
  selectedChannelId: string = '';

  constructor(
    public dialogRef: MatDialogRef<DeleteMessageDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      messageId: string;
      messageText: string;
      theme: boolean;
      channelId: string;
      teamId: string;
    },
    private userService: UserService,
    private backendService: BackendService,
    private dataService: DataService
  ) {
    this.dataService.currentTeamId.subscribe((teamId) => {
      this.selectedTeamId = teamId;
    });
    this.dataService.currentChannelId.subscribe((channelId) => {
      this.selectedChannelId = channelId;
    });
    this.dataService.isDarkTheme.subscribe((theme) => {
      this.isDarkTheme = theme;
    });
  }

  async ngOnInit(): Promise<void> {
    await this.checkIfCreator(this.selectedChannelId);
  }

  // Check if the user is the creator of the channel
  private async checkIfCreator(channelId: string): Promise<void> {
    const currentUser = this.userService.getUser();
    if (!currentUser) {
      console.error('User not found');
      return;
    }

    try {
      const channel = await this.backendService.getChannelById(channelId);
      if (channel) {
        this.isCreator = channel.members[0] === currentUser.userId;
      }
    } catch (error) {
      console.error('Error checking channel creator:', error);
    }
  }

  // Cancel: close the dialog
  onCancel(): void {
    this.dialogRef.close();
  }

  // Confirm deletion if creator
  onConfirm(): void {
    console.log('isCreator:', this.isCreator);
    if (this.isCreator) {
      console.log('Creator can delete the message');
      this.dialogRef.close(this.data.messageId);
    } else {
      alert(
        'You are not the creator of this channel and cannot delete this message.'
      );
    }
  }
}
