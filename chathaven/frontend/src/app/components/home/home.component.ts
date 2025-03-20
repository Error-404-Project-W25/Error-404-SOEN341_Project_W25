import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { GeminiService } from '@services/gemini.service';
import { CommonModule } from '@angular/common'; // Add this import
import { FormsModule } from '@angular/forms'; // Add this import
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule], // Add this line
})
export class HomeComponent {
  isChatCardVisible: boolean = true; // Toggle chat visibility
  userMessage: string = ''; // Stores user input
  messages: { type: 'incoming' | 'outgoing'; content: string }[] = [];
  isLoading: boolean = false; // Show loading while waiting for GPT response

  constructor(
    private router: Router,
    private userService: UserService,
    private geminiService: GeminiService
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

  sendMessage() {
    if (this.userMessage.trim()) {
      this.messages.push({ type: 'outgoing', content: this.userMessage });

      this.geminiService.generateText(this.userMessage).subscribe({
        next: (response) => {
          console.log('API Response:', response);
          const aiResponse = response.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here to assist with ChatHaven-related questions only.";
          this.messages.push({ type: 'incoming', content: aiResponse });
        },
        error: (err) => {
          console.error('API Error:', err);
          console.error('Error Details:', err.error); // Log more details
          this.messages.push({ type: 'incoming', content: '⚠️ API Error: Unable to fetch response' });
        }
      });

      this.userMessage = '';
    }
  }


}
