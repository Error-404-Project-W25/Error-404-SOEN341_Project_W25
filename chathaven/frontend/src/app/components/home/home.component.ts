import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Add this import
import { FormsModule } from '@angular/forms'; // Add this import
import { UserService } from '@services/user.service';
import { BackendService } from '@services/backend.service'; // Add this import
import { TextToHtmlPipe } from './../../../pipes/textToHtml.pipe'; // Add this import

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, TextToHtmlPipe], // Add TextToHtmlPipe to imports
})
export class HomeComponent {
  isChatCardVisible: boolean = true; // Toggle chat visibility
  userMessage: string = ''; // Stores user input
  messages: { type: 'incoming' | 'outgoing'; content: string }[] = [];
  isLoading: boolean = false; // Show loading while waiting for GPT response

  constructor(
    private router: Router,
    private userService: UserService,
    private backendService: BackendService // private geminiService: GeminiService
  ) {}

  // On load / reload, check if user is logged in and go to chat if necessary
  ngOnInit() {
    this.userService.checkIfLoggedIn().then((isLoggedIn) => {
      if (isLoggedIn) {
        this.router.navigate(['/chat']);
      }
    });
  }

  // Navigate to the login page and open sign-up form (detect query parameters()
  goToLogin(showSignUp: boolean = false) {
    this.router.navigate(['/login'], { queryParams: { signup: showSignUp } });
  }

  toggleChatCard() {
    const chatCard = document.getElementById('chatCard');
    if (chatCard?.style.display === 'none') {
      chatCard.style.display = 'block';
    } else if (chatCard) {
      chatCard.style.display = 'none';
    }
  }

  private scrollToBottom(): void {
    const chatLog = document.querySelector('.chat-window');
    if (chatLog) {
      chatLog.scrollTop = chatLog.scrollHeight;
    }
  }

  sendMessage() {
    if (this.userMessage.trim()) {
      this.messages.push({ type: 'outgoing', content: this.userMessage });
      this.backendService
        .promptChatbot(this.userMessage)
        .then((response) => {
          if (!response) {
            throw new Error('Empty response from API');
          }
          const aiResponse = response; // Removed fallback message
          this.messages.push({ type: 'incoming', content: aiResponse });
          setTimeout(() => this.scrollToBottom(), 50);
        })
        .catch((err) => {
          console.error('API Error:', err);
          console.error('Error Details:', err.error); // Log more details
          this.messages.push({
            type: 'incoming',
            content: '⚠️ API Error: Unable to fetch response',
          });
        });
      this.userMessage = '';
    }
  }
}
