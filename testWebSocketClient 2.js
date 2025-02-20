import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebSocketService } from '../../../services/websocket.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-websocket-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h3>WebSocket Test</h3>
      <button (click)="testConnection()">Test Connection</button>
      <button (click)="sendTestMessage()">Send Test Message</button>
      <div>
        <h4>Messages:</h4>
        <ul>
          <li *ngFor="let message of messages">
            {{ message.content }} - {{ message.date }}
          </li>
        </ul>
      </div>
    </div>
  `
})
export class WebSocketTestComponent implements OnInit, OnDestroy {
  messages: IMessage[] = [];

  constructor(private webSocketService: WebSocketService) {}

  ngOnInit() {
    this.webSocketService.messages$.subscribe(messages => {
      this.messages = messages;
      console.log('Messages updated:', messages);
    });
  }

  testConnection() {
    this.webSocketService.joinRoom('test-room');
  }

  sendTestMessage() {
    this.webSocketService.sendMessage(
      'Test message ' + new Date().toISOString(),
      'test-room',
      'test-user'
    );
  }

  ngOnDestroy() {
    // Cleanup subscriptions
  }
}