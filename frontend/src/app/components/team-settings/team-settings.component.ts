import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { BackendService } from '@services/backend.service';  // Make sure the service is imported

@Component({
  selector: 'app-team-settings',
  templateUrl: './team-settings.component.html',
  styleUrls: ['./team-settings.component.css'],
  standalone: true,
  imports: [MatDialogModule, MatInputModule, FormsModule, MatButtonModule],
})
export class TeamSettingsComponent {
  teamName = '';
  description = '';

  constructor(
    public dialogRef: MatDialogRef<TeamSettingsComponent>,
    private backendService: BackendService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Initialize the form with the existing team data
    this.teamName = data.name;
    this.description = data.description;
  }

  // Update team settings (could interact with the backend service)
  /*
  async updateTeam(): Promise<void> {
    if (this.teamName && this.description) {
      // Call backend service to update team settings
      const success = await this.backendService.updateTeam(
        this.data.team_id,
        this.teamName,
        this.description
      );

      if (success) {
        // Close the dialog and return the updated data
        this.dialogRef.close({
          name: this.teamName,
          description: this.description,
        });
      } else {
        console.error('Failed to update team');
      }
    }
  }

   */
}
