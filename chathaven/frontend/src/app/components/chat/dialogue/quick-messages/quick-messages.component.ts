import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-quick-messages',
  templateUrl: './quick-messages.component.html',
  styleUrls: ['./quick-messages.component.css']
})
export class QuickMessagesComponent {
  @Input() messages: string[] = [
    'Sounds good',
    'Thank you',
    'I agree',
    'Can you explain more?',
    'Great!',
  ];

  @Input() theme: 'dark' | 'light' = 'dark';

  @Output() messageSelected = new EventEmitter<string>();

  selectMessage(message: string): void {
    this.messageSelected.emit(message);
  }
}
