import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-quick-messages',
  templateUrl: './quick-messages.component.html',
  styleUrls: ['./quick-messages.component.css']
})
export class QuickMessagesComponent {
  // List of predefined quick messages
  quickMessages: string[] = [
    'Sounds good!',
    'Great work!',
    'Thank you!',
    'Can you explain?'
  ];

  // Event emitter to send the selected message to the parent component
  @Output() quickMessageSelected = new EventEmitter<string>();

  // Handle the quick message selection
  onQuickMessageClick(message: string) {
    this.quickMessageSelected.emit(message);
  }
}
