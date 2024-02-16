import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PrivateMessage } from '../classes/private-message.class';

@Injectable({
  providedIn: 'root'
})
export class PrivateMessageService {
  private selectedPrivateMessageSubject = new BehaviorSubject<PrivateMessage | null>(null);

  selectedPrivateMessage$ = this.selectedPrivateMessageSubject.asObservable();
  public userSelected: EventEmitter<{ user: any; privateMessageId: string }> = new EventEmitter();
  constructor() { }
  private messages: PrivateMessage[] = [];
  setSelectedPrivateMessage(privateMessage: PrivateMessage): void {
    console.log(privateMessage);
    this.selectedPrivateMessageSubject.next(privateMessage);
  }

  getSelectedPrivateMessage(): PrivateMessage | null {
    console.log(this.selectedPrivateMessageSubject.value);
    return this.selectedPrivateMessageSubject.value;
  }
}
