import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { Router } from '@angular/router';
import { BackendService } from '@services/backend.service';
import { UserService } from '@services/user.service';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockBackendService: jasmine.SpyObj<BackendService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockUserService = jasmine.createSpyObj('UserService', ['checkIfLoggedIn']);
    mockBackendService = jasmine.createSpyObj('BackendService', [
      'promptChatbot',
    ]);

    await TestBed.configureTestingModule({
      imports: [HomeComponent, FormsModule], // Add HomeComponent to imports
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: UserService, useValue: mockUserService },
        { provide: BackendService, useValue: mockBackendService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to chat if user is logged in on init', () => {
    mockUserService.checkIfLoggedIn.and.returnValue(Promise.resolve(true));
    component.ngOnInit();
    expect(mockUserService.checkIfLoggedIn).toHaveBeenCalled();
    setTimeout(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/chat']);
    });
  });

  it('should toggle chat card visibility', () => {
    expect(component.isChatCardOpen).toBeFalse();

    component.toggleChatCard();
    expect(component.isChatCardOpen).toBeTrue();

    component.toggleChatCard();
    expect(component.isChatCardOpen).toBeFalse();
  });

  it('should send a message and receive a response', async () => {
    component.userMessage = 'Hello';
    mockBackendService.promptChatbot.and.returnValue(
      Promise.resolve('Hi there!')
    );

    await component.sendMessage();

    expect(component.messages.length).toBe(2);
    expect(component.messages[0].content).toBe('Hello');
    expect(component.messages[1].content).toBe('Hi there!');
    expect(component.userMessage).toBe('');
  });

  it('should handle empty response from backend gracefully', async () => {
    component.userMessage = 'Hello';
    mockBackendService.promptChatbot.and.returnValue(Promise.resolve(undefined)); // Simulate empty response

    await component.sendMessage();

    expect(component.messages.length).toBe(2);
    expect(component.messages[0].content).toBe('Hello');
    expect(component.messages[1].content).toBe('No response received'); // Check fallback message
    expect(component.userMessage).toBe('');
  });

  it('should handle API error when sending a message', async () => {
    component.userMessage = 'Hello';
    mockBackendService.promptChatbot.and.returnValue(Promise.reject('API Error'));

    await component.sendMessage();

    expect(component.messages.length).toBe(1); // Only the outgoing message should be present
    expect(component.messages[0].content).toBe('Hello');
  });
});
