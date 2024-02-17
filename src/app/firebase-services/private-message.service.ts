import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PrivateMessage } from '../classes/private-message.class';

@Injectable({
  providedIn: 'root',
})
export class PrivateMessageService {
  private selectedPrivateMessageSubject = new BehaviorSubject<PrivateMessage | null>(null);
  selectedPrivateMessage$ = this.selectedPrivateMessageSubject.asObservable();
  public userSelected: EventEmitter<{ user: any; privateMessageId: string }> = new EventEmitter();

  constructor() {}

  setSelectedPrivateMessage(privateMessage: PrivateMessage): void {
    this.selectedPrivateMessageSubject.next(privateMessage);
  }

  getSelectedPrivateMessage(): PrivateMessage | null {
    return this.selectedPrivateMessageSubject.value;
  }
}
