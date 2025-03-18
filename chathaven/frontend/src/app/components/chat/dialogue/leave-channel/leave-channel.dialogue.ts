import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { BackendService } from '@services/backend.service';

@Component({
    selector: 'app-leave-channel',
    templateUrl: './leave-channel.dialogue.html',
    styleUrls: ['./leave-channel.dialogue.css', '../../../../../assets/theme.css'],
})

export class RemoveMemberDialogComponent {
  isDarkTheme: boolean = false; // Dark theme by default
  selectedTeamId: string = ''; // Selected team ID
  selectedChannelId: string = ''; // Selected channel ID
  channelTitle: string = ''; // Channel title

  constructor(
    private dialogRef: MatDialogRef<RemoveMemberDialogComponent>,
    private backendService: BackendService,
    @Inject(MAT_DIALOG_DATA) public data: { channelId: string; memberId: string }
  ) {}

  async onConfirm(): Promise<void> {
    const success = await this.backendService.removeMemberFromChannel(
      this.data.channelId,
      this.data.memberId
    );
    this.dialogRef.close(success);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}