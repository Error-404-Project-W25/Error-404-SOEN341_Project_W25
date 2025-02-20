import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '../../../services/webSocket.service';
import { IMessage } from '@shared/interfaces';

@Component({
  selector: 'app-websocket-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="websocket-test">
      <h3>WebSocket Test Panel</h3>
      <div class="status">
        Connection Status: 
        <span [class]="socketConnected ? 'connected' : 'disconnected'">
          {{ socketConnected ? 'Connected' : 'Disconnected' }}
        </span>
      </div>
      <div class="controls">
        <button (click)="testConnection()">Test Connection</button>
        <button (click)="sendTestMessage()">Send Test Message</button>
      </div>
      <div class="messages">
        <h4>Messages:</h4>
        <ul>
          <li *ngFor="let message of messages">
            {{ message.content }} 
            <small>({{ message.date }})</small>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .websocket-test { padding: 1rem; }
    .status { margin: 1rem 0; }
    .connected { color: green; }
    .disconnected { color: red; }
    .controls button { margin-right: 0.5rem; }
    .messages li { margin: 0.5rem 0; }
  `]
})
export class WebSocketTestComponent implements OnInit, OnDestroy {
  messages: IMessage[] = [];
  socketConnected = false;

  constructor(private webSocketService: WebSocketService) {}

  ngOnInit() {
    // Subscribe to messages
    this.webSocketService.messages$.subscribe({
      next: (messages) => {
        this.messages = messages;
        console.log('Messages updated:', messages);
      },
      error: (error) => console.error('Messages subscription error:', error)
    });

    // Monitor connection status
    this.webSocketService.connectionStatus$.subscribe(
      (connected) => {
        this.socketConnected = connected;
        console.log(connected ? 'Socket connected' : 'Socket disconnected');
      }
    );
  }

  testConnection() {
    const testRoom = `test-${Date.now()}`;
    console.log('Joining test room:', testRoom);
    this.webSocketService.joinRoom(testRoom);
  }

  sendTestMessage() {
    const testMessage = {
      content: `Test message at ${new Date().toLocaleTimeString()}`,
      conversationId: 'test-room',
      sender: 'test-user'
    };
    
    this.webSocketService.sendMessage(
      testMessage.content,
      testMessage.conversationId,
      testMessage.sender
    );
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.webSocketService.socket.disconnect();
  }
}