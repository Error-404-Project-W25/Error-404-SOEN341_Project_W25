import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocketSubject<any>;

  constructor() {
    this.socket$ = webSocket('http://localhost:3000'); // Replace with your WebSocket server URL
  }

  sendMessage(message: string): void {
    this.socket$.next({ type: 'message', data: message });
  }

  getMessages() {
    return this.socket$.asObservable();
  }
}