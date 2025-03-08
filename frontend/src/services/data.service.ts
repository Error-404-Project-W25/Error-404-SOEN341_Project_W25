import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class DataService {
  private teamId = new BehaviorSubject<string>('');
  currentTeamId = this.teamId.asObservable();

  private directMessageId = new BehaviorSubject<string>('');
  currentDirectMessageId = this.directMessageId.asObservable();

  private channelId = new BehaviorSubject<string>('');
  currentChannelId = this.channelId.asObservable();

  private isDirectMessageSelected = new BehaviorSubject<boolean>(false);
  isDirectMessage = this.isDirectMessageSelected.asObservable();

  selectTeam(selectedTeamId: string) {
    this.teamId.next(selectedTeamId);
  }

  selectDirectMessage(selectedDirectMessageId: string) {
    this.directMessageId.next(selectedDirectMessageId);
  }

  selectChannel(selectedDirectMessageId: string) {
    this.directMessageId.next(selectedDirectMessageId);
  }

  selectIsDirectMessage(isDirectMessage: boolean) {
    this.isDirectMessageSelected.next(isDirectMessage);
    if (isDirectMessage) {
      this.channelId.next('');
    } else {
      this.directMessageId.next('');
    }
  }
}
