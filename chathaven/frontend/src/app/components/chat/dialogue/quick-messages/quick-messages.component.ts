import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-quick-messages',
  templateUrl: './quick-messages.component.html',
  styleUrls: ['./quick-messages.component.css'],
  standalone: true,
})
export class QuickMessagesComponent {
  // Create an event emitter to pass the message back to the parent
  @Output() quickMessageSent: EventEmitter<string> = new EventEmitter<string>();

  // Method to send the quick message
  sendQuickMessage(message: string): void {
    this.quickMessageSent.emit(message); // Emit the message to the parent
  }
}
