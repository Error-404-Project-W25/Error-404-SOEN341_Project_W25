import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class AppComponent {
  title = 'chatHaven';
  servers: string[] = [
    'S1',
    'S2',
    'S3',
    'S4',
    'S5',
    'S6',
    'S7',
    'S8',
    'S9',
    'S10',
    'S11',
    'S12',
    'S13',
    'S14',
    'S15',
  ];
  channels: string[] = [
    'Channel 1',
    'Channel 2',
    'Channel 3',
    'Channel 4',
    'Channel 5',
    'Channel 6',
    'Channel 7',
    'Channel 8',
    'Channel 9',
    'Channel 10',
    'Channel 11',
    'Channel 12',
    'Channel 13',
    'Channel 14',
    'Channel 15',
  ];
  selectedServer: string | null = null;
  selectedChannel: string | null = null;

  selectServer(server: string) {
    /*function for when server is clicked*/
    console.log('You are inside the selectServer function');
    console.log();
  }

  selectChannel(channel: string) {
    /*function for when channel is clicked*/
    console.log('You are inside the selectChannel function');
    console.log();
  }
  onEnter($event: KeyboardEvent): void {
    // Handle the enter key event
    console.log('Enter key pressed', $event);
  }
  onSearch($event: Event): void {
    console.log($event);
  }
}
