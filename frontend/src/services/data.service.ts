import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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

  private isInformationSelected = new BehaviorSubject<boolean>(false);
  isInformationOpen = this.isInformationSelected.asObservable();

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
  }

  toggleDarkMode(isDarkTheme: boolean) {
    this.isDarkThemeSelected.next(isDarkTheme);
  }

  toggleIsInformationOpen(isInformationOpen: boolean) {
    this.isInformationSelected.next(isInformationOpen);
  }
}
