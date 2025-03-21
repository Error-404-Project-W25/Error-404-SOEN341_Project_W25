import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BackendService } from '@services/backend.service';
import { DataService } from '@services/data.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-delete-message',
  templateUrl: './delete-message.dialogue.html',
  styleUrls: ['./delete-message.dialogue.css'],
})
export class DeleteMessageDialog {
  isDarkTheme: boolean = false; // Dark theme by default
  isCreator: boolean = false; // Flag to check if the user is the channel creator
  selectedTeamId: string = ''; // Selected team ID
  selectedChannelId: string = ''; // Selected channel ID

  constructor(
    public dialogRef: MatDialogRef<DeleteMessageDialog>, // Dialog reference
    @Inject(MAT_DIALOG_DATA)
    public data: {
      messageId: string;
      messageText: string;
      theme: boolean;
      channelId: string;
      teamId: string;
    }, // Injected data (message info)
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
    // this.selectedChannelId = data.channelId; // Set the channel ID based on the injected data
    this.checkIfCreator(this.selectedChannelId); // Check if the user is the creator of the channel
    this.dataService.isDarkTheme.subscribe((theme) => {
      this.isDarkTheme = theme; // Set the theme based on the injected data
    });
  }

  //checking if its the creator of the channel
  private async checkIfCreator(
    channelId: string
  ): Promise<void> {
    const currentUser = this.userService.getUser(); 
    if (!currentUser) {
      console.error('User not found');
      return;
    }

    try {
      const channel = await this.backendService.getChannelById(
        channelId
      ); 

      if (channel) {
        this.isCreator = channel.members[0] === currentUser.userId;
      }
    } catch (error) {
      console.error('Error checking channel creator:', error);
    }
  }

  // Close the dialog without performing any action (Cancel)
  onCancel(): void {
    this.dialogRef.close();
  }

  // Confirm deletion, close the dialog, and pass the message ID back for removal
  onConfirm(): void {
    console.log('isCreator:', this.isCreator);
    if (this.isCreator) {
      console.log('Creator can delete the message');
      this.dialogRef.close(this.data.messageId); // Return the message ID to be deleted
    } else {
      // If not the creator, show a simple alert message
      alert(
        'You are not the creator of this channel and cannot delete this message.'
      );
    }
  }
}
