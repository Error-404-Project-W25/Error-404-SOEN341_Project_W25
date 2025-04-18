import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable()
export class DataService {
  private teamId = new BehaviorSubject<string>('');
  currentTeamId = this.teamId.asObservable();

  private channelId = new BehaviorSubject<string>('');
  currentChannelId = this.channelId.asObservable();

  private conversationId = new BehaviorSubject<string>('');
  currentConversationId = this.conversationId.asObservable();

  private isDirectMessageSelected = new BehaviorSubject<boolean>(false);
  isDirectMessage = this.isDirectMessageSelected.asObservable();

  private isDarkThemeSelected = new BehaviorSubject<boolean>(true);
  isDarkTheme = this.isDarkThemeSelected.asObservable();

  private isInformationSelected = new BehaviorSubject<boolean>(true);
  isInformationOpen = this.isInformationSelected.asObservable();

  private messageIdSource = new BehaviorSubject<string>('');
  selectedMessageId = this.messageIdSource.asObservable();

  // ADD THIS FOR DM REFRESH
  private refreshDirectMessagesSource = new Subject<void>();
  refreshDirectMessages$ = this.refreshDirectMessagesSource.asObservable();

  selectTeam(selectedTeamId: string) {
    this.teamId.next(selectedTeamId);
  }

  selectChannel(selectedChannelId: string) {
    this.channelId.next(selectedChannelId);
  }

  selectConversation(selectedConversationId: string) {
    this.conversationId.next(selectedConversationId);
  }

  toggleIsDirectMessage(isDirectMessage: boolean) {
    this.isDirectMessageSelected.next(isDirectMessage);
    // this.conversationId.next('');
  }

  toggleDarkMode(isDarkTheme: boolean) {
    this.isDarkThemeSelected.next(isDarkTheme);
  }

  toggleIsInformationOpen(isInformationOpen: boolean) {
    this.isInformationSelected.next(isInformationOpen);
  }

  resetAll() {
    this.teamId.next('');
    this.channelId.next('');
    this.conversationId.next('');
    this.isDirectMessageSelected.next(false);
  }

  selectMessage(messageId: string) {
    this.messageIdSource.next(messageId);
  }

  // ADD THIS FUNCTION TO TRIGGER REFRESH
  triggerDirectMessagesRefresh() {
    this.refreshDirectMessagesSource.next();
  }
}