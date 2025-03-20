import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private apiKey: string = 'Gemini_API_Key'; // Replace with your API key
  private apiUrl: string =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

  constructor(private http: HttpClient) {}

  generateText(prompt: string): Observable<any> {
    if (!this.isRelevantQuestion(prompt)) {
      return of({
        response: "I'm here to assist with ChatHaven-related questions only.",
      });
    }
    const systemPrompt = `
  You are ChatHaven’s AI assistant. ChatHaven is a powerful communication platform designed for teams and communities.

  Features include:
  - Text Channels for public/private group conversations.
  - Direct Messaging (DM) for private 1-on-1 chats.
  - Role-Based Permissions: Admins can create/delete channels and moderate messages.
  - Secure User Authentication & Management.
  - User Presence: Online, offline, away status, and last seen timestamps.
  - Message Enhancements: Emojis, quoting messages.
  - Custom chatbot integration (e.g., Welcome Bot, Translation Bot).

  Always answer questions **based on this information** and ignore unrelated topics by saying it is "I'm here to assist with ChatHaven-related questions only.".

  Now, answer the user's question with a maximum of 100 words:
  User: ${prompt}
  `;

    const requestBody = {
      contents: [{ parts: [{ text: systemPrompt }] }], // Correct format
    };

    return this.http.post(`${this.apiUrl}?key=${this.apiKey}`, requestBody);
  }

  isRelevantQuestion(prompt: string): boolean {
    const allowedKeywords = [
      'ChatHaven',
      'chat',
      'direct message',
      'DM',
      'text channel',
      'permissions',
      'authentication',
      'user presence',
      'role-based access',
      'bot integration',
    ];

    return allowedKeywords.some((keyword) =>
      prompt.toLowerCase().includes(keyword.toLowerCase())
    );
  }
}
