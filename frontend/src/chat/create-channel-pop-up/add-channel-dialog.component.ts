/* Create channel Pop Up */

import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-channel-dialog',
  templateUrl: './add-channel-dialog.component.html',
  styleUrls: ['./add-channel-dialog.component.css'],
  standalone: true,
  imports: [
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    HttpClientModule,
  ],
})
export class AddChannelDialogComponent {
  searchQuery = ''; // input from 'input matInput' is stored in searchQuery
  channelName = '';
  description = '';

  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<AddChannelDialogComponent>
  ) {}

  search() {
    // when the button is clicked, the search function is called
    console.log('searching for:', this.searchQuery);
  }

  createChannel() {
    const channelData = {
      user_id: 'exampleUserId', // Replace with actual user ID
      username: 'exampleUsername', // Replace with actual username
      channel_name: this.channelName,
      description: this.description,
      members: [],
      role: 'admin',
    };

    this.http.post('/api/channels', channelData).subscribe(
      (response) => {
        console.log('channel created successfully:', response);
        this.dialogRef.close(); // Close the dialog
      },
      (error) => {
        console.error('Error creating channel:', error);
      }
    );
  }
}
