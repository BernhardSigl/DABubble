import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PrivateMessage } from '../classes/private-message.class';

@Injectable({
  providedIn: 'root',
})
export class PrivateMessageService {
  private selectedPrivateMessageSubject = new BehaviorSubject<PrivateMessage | null>(null);
  selectedPrivateMessage$ = this.selectedPrivateMessageSubject.asObservable();

  private selectedUserSubject = new BehaviorSubject<{ user: any; privateMessageId: string } | null>(null);
  selectedUser$ = this.selectedUserSubject.asObservable();

  constructor() {}

  setSelectedPrivateMessage(privateMessage: PrivateMessage): void {
    this.selectedPrivateMessageSubject.next(privateMessage);
  }

  setSelectedUser(user: any, privateMessageId: string): void {
    this.selectedUserSubject.next({ user, privateMessageId });
  }

  getSelectedPrivateMessage(): PrivateMessage | null {
    return this.selectedPrivateMessageSubject.value;
  }
}
