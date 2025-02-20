import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { IMessage } from '@shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  socket: Socket;
  private messagesSubject = new BehaviorSubject<IMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  connectionStatus$ = this.connectionStatusSubject.asObservable();

  constructor() {
    this.socket = io('http://localhost:3000');
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    this.socket.on('connect', () => {
      console.log('WebSocket connected, socket ID:', this.socket.id);
      this.connectionStatusSubject.next(true);
    });
  
    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.connectionStatusSubject.next(false);
    });
  
    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.connectionStatusSubject.next(false);
    });
    
    this.socket.on('newMessage', (message: IMessage) => {
      const currentMessages = this.messagesSubject.value;
      this.messagesSubject.next([...currentMessages, message]);
    });

    this.socket.on('deleteMessage', (messageId: string) => {
      const currentMessages = this.messagesSubject.value;
      this.messagesSubject.next(
        currentMessages.filter(msg => msg.messageId !== messageId)
      );
    });
  }

  joinRoom(conversationId: string): void {
    this.socket.emit('joinRoom', { conversationId });
  }

  sendMessage(content: string, conversationId: string, sender: string): void {
    this.socket.emit('sendMessage', { content, conversationId, sender });
  }

  getMessages(conversationId: string): void {
    this.socket.emit('getMessages', { conversationId }, (response: { messages: IMessage[] }) => {
      this.messagesSubject.next(response.messages);
    });
  }
}