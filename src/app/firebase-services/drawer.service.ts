import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Message } from '../classes/message.class';
import {
  Firestore,
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class DrawerService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  isOpen$ = this.isOpenSubject.asObservable();
  selectedMessageChanged: EventEmitter<Message | null> = new EventEmitter();
  private selectedMessage: Message | null = null;
  private selectedThreadMessagesSource = new BehaviorSubject<Message[]>([]);
  selectedThreadMessages$ = this.selectedThreadMessagesSource.asObservable();
  private sideNavBtnStatusSubject = new BehaviorSubject<boolean>(true);
  sideNavBtnStatus$ = this.sideNavBtnStatusSubject.asObservable();
  threadOpened: EventEmitter<boolean> = new EventEmitter<boolean>();

  isSelectedForMobile: boolean = false;
  threadIsOpen!: boolean;

  constructor(private firestore: Firestore) {
  }

  setSelectedMessage(message: Message): void {
    this.selectedMessage = message;
    this.selectedMessageChanged.emit(this.selectedMessage);
    this.loadThreadMessages(message);
    this.setSideNavBtnStatus(false);
  }

  private async loadThreadMessages(mainMessage: Message): Promise<void> {
    if (!mainMessage.messageId) {
      console.error('Main message ID is required to load thread messages.');
      return;
    }

    const threadsRef = collection(
      this.firestore,
      `messages/${mainMessage.messageId}/threads`
    );
    const q = query(threadsRef); // Add orderBy here if you want to sort the messages

    try {
      const querySnapshot = await getDocs(q);
      const threadMessages: Message[] = [];
      querySnapshot.forEach((doc) => {
        let message = doc.data() as Message;
        message.messageId = doc.id; // Optionally, add the document ID to the message object
        threadMessages.push(message);
      });
      this.selectedThreadMessagesSource.next(threadMessages);
    } catch (error) {
      console.error('Error fetching thread messages:', error);
    }
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
    this.setSideNavBtnStatus(true);
    console.log('close');
  }

  setSideNavBtnStatus(status: boolean): void {
    this.sideNavBtnStatusSubject.next(status);
  }

  openThread() {
    this.threadIsOpen = !this.threadIsOpen;
    this.threadOpened.emit(true);
    console.log(this.threadIsOpen);
  }

  openThreadMobile() {
    console.log('thread is open');
  }

  closeThreadMobile() {
    console.log('thread is closed');
  }

  isSideNavMobileVisible(): boolean {
    return window.localStorage.getItem('sideNavMobileStatus') === 'visible';
  }

  redirectToSideNav() {
    this.isSelectedForMobile = false;
    window.localStorage.setItem('sideNavMobileStatus', 'visible');
    window.localStorage.removeItem('closeSideNav');
  }
}
