import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private apiKey = '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'; // ✅ Replace with your OpenRouter API key

  constructor(private http: HttpClient) {}

  chat(message: string): Observable<any> {
    const body = {
      model: 'mistral', // 🔹 Use a supported model like "mistral" or "mixtral"
      messages: [{ role: 'user', content: message }],
      temperature: 0.7,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'HTTP-Referer': 'http://localhost:4200', // 🔹 Replace with your actual app or website URL
      'X-Title': 'ChatHaven', // 🔹 Short app name (you can choose any name)
    });

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      return throwError('Unauthorized: Check API key and required headers.');
    } else if (error.status === 400) {
      return throwError('Bad Request: Check model name and request format.');
    } else if (error.status === 429) {
      return throwError('Too many requests. Try again later.');
    } else {
      return throwError('An error occurred. Please try again.');
    }
  }
}

