import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private apiKey: string = 'GEMINI_API_KEY';
  private apiUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

  constructor(private http: HttpClient) {}

  generateText(prompt: string): Observable<any> {
    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }] // Correct format
    };

    return this.http.post(`${this.apiUrl}?key=${this.apiKey}`, requestBody);
  }

}
