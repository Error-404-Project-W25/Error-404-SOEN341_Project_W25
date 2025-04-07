// quick-messages.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-quick-messages',
  templateUrl: './quick-messages.component.html',
  styleUrls: ['./quick-messages.component.scss']
})
export class QuickMessagesComponent {
  @Input() messages: string[] = [
    'Hey',
    'Thanks',
    'Sounds good',
    'I agree',
  ];

  @Input() theme: 'dark' | 'light' = 'dark';

  @Output() messageSelected = new EventEmitter<string>();

  selectMessage(message: string): void {
    this.messageSelected.emit(message);
  }
}
