import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Message } from '../classes/message.class';

@Injectable({
  providedIn: 'root',
})
export class DrawerService {
  private isOpenSubject = new BehaviorSubject<boolean>(true);
  isOpen$ = this.isOpenSubject.asObservable();
  selectedMessageChanged: EventEmitter<Message | null> = new EventEmitter();

  constructor() {}
  private selectedMessage: Message | null = null;
  setSelectedMessage(message: Message): void {
    this.selectedMessage = message;
    this.selectedMessageChanged.emit(this.selectedMessage);
  }

  getSelectedMessage(): Message | null {
    return this.selectedMessage;
  }
  openDrawer(message: Message): void {
    this.setSelectedMessage(message);
    this.isOpenSubject.next(true);
  }

  closeDrawer(): void {
    this.isOpenSubject.next(false);
  }
}
