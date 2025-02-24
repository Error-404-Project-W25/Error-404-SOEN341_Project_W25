import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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
  constructor(
    public dialogRef: MatDialogRef<DeleteMessageComponent>, // Dialog reference
    @Inject(MAT_DIALOG_DATA)
    public data: { messageId: string; messageText: string; theme: boolean } // Injected data (message info)
  ) {
    this.isDarkTheme = data.theme; // Set the theme based on the injected data
  }

  // Close the dialog without performing any action (Cancel)
  onCancel(): void {
    this.dialogRef.close();
  }

  // Confirm deletion, close the dialog, and pass the message ID back for removal
  onConfirm(): void {
    this.dialogRef.close(this.data.messageId); // Return the message ID to be deleted
  }
}
