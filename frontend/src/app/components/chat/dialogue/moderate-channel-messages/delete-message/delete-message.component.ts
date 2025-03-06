import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-delete-message',
  templateUrl: './delete-message.component.html',
  styleUrls: [
    './../../../../../../assets/theme.css',
    './delete-message.component.css',
  ],
})
export class DeleteMessageComponent {
  isDarkTheme: boolean = false; // Dark theme by default
  isCreator: boolean = false; // Flag to check if the user is the channel creator

  constructor(
    public dialogRef: MatDialogRef<DeleteMessageComponent>, // Dialog reference
    @Inject(MAT_DIALOG_DATA)
    public data: { messageId: string; messageText: string; theme: boolean, channelId : string, teamId: string }, // Injected data (message info)
    private userService: UserService,
    private backendService: BackendService
  ) {
    this.isDarkTheme = data.theme; // Set the theme based on the injected data
    this.checkIfCreator(data.teamId, data.channelId);
  }

  //checking if its the creator of the channel
  private async checkIfCreator(teamId: string, channelId: string): Promise<void> {
    const currentUser = this.userService.getUser(); // Get current user
    if (!currentUser) {
      console.error('User not found');
      return;
    }

    try {
      // Step 1: Retrieve the channel to get its team_id
      const channel = await this.backendService.getChannelById(teamId, channelId); // Pass currentUser.user_id instead of teamId

      if (channel) {
        channel.members[0] === currentUser.user_id ? this.isCreator = true : this.isCreator = false;
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
    if (this.isCreator) {
      console.log('Creator can delete the message');
      this.dialogRef.close(this.data.messageId); // Return the message ID to be deleted
    }
  }
}
