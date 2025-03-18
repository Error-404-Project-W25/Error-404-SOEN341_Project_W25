import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from 'src/services/chat.service';
import { CommonModule } from '@angular/common'; // Add this import
import { FormsModule } from '@angular/forms'; // Add this import

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule], // Add this line
})
export class HomeComponent {
  constructor(private router: Router, private chatService: ChatService) {}

  isChatCardVisible: boolean = true; // Toggle chat visibility
  userMessage: string = ''; // Stores user input
  messages: { type: 'incoming' | 'outgoing'; content: string }[] = [];
  isLoading: boolean = false; // Show loading while waiting for GPT response

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

  async sendMessage() {
    console.log(this.userMessage);
    if (!this.userMessage.trim()) return; // Prevent empty messages

    // Add user's message to chat
    this.messages.push({ type: 'outgoing', content: this.userMessage });

    // Clear input field
    const userInput = this.userMessage;
    this.userMessage = '';
    this.isLoading = true;

    try {
      // Get GPT response
      this.chatService.chat(userInput).subscribe(
        (response: string) => {
          this.messages.push({ type: 'incoming', content: response });
        },
        (error) => {
          this.messages.push({
            type: 'incoming',
            content: 'Error getting response.',
          });
        },
        () => {
          this.isLoading = false;
        }
      );
    } catch (error) {
      this.messages.push({
        type: 'incoming',
        content: 'Error getting response.',
      });
    } finally {
      this.isLoading = false;
    }
  }
}
