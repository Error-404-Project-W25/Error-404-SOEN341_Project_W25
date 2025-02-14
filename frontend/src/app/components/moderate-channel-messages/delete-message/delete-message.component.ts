import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-message',
  templateUrl: './delete-message.component.html',
  styleUrls: ['./delete-message.component.css']
})
export class DeleteMessageComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteMessageComponent>, // Dialog reference
    @Inject(MAT_DIALOG_DATA) public data: { messageId: string, messageText: string } // Injected data (message info)
  ) {}

  // Close the dialog without performing any action (Cancel)
  onCancel(): void {
    this.dialogRef.close();
  }

  // Confirm deletion, close the dialog, and pass the message ID back for removal
  onConfirm(): void {
    this.dialogRef.close(this.data.messageId); // Return the message ID to be deleted
  }
}
