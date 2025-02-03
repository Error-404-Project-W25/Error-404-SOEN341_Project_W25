/* Create team Pop Up */

import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-team-dialog',
  templateUrl: './add-team-dialog.component.html',
  styleUrls: ['../../app/app.component.css'],
  standalone: true,
  imports: [MatDialogModule, MatInputModule, FormsModule, MatButtonModule],
})
export class AddTeamDialogComponent {
  searchQuery = ''; // input from 'input matInput' is stored in searchQuery
  search() {
    // when the button is clicked, the search function is called
    console.log('searching for:', this.searchQuery);
  }
}
