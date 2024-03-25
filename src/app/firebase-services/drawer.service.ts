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
  showSideNavOnMobileToggle: EventEmitter<void> = new EventEmitter<void>();
  public windowWidth: BehaviorSubject<number> = new BehaviorSubject<number>(window.innerWidth);

  isSelectedForMobile: boolean = false;
  threadIsOpen: boolean = false;

  constructor(private firestore: Firestore) {   
    window.addEventListener('resize', () => {
      this.windowWidth.next(window.innerWidth);
    }); 
  }

  setSelectedMessage(message: Message): void {
    this.selectedMessage = message;
    this.selectedMessageChanged.emit(this.selectedMessage);
    this.loadThreadMessages(message);
    this.setSideNavBtnStatus(false);
  }

   async loadThreadMessages(mainMessage: Message): Promise<void> {
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

  openThread() {
    this.threadIsOpen = true;
    this.isOpenSubject.next(true);
    this.threadOpened.emit(true);
  }

  closeDrawer(): void {
    this.threadIsOpen = false;
    this.isOpenSubject.next(false);
    this.setSideNavBtnStatus(true);
  }

  setSideNavBtnStatus(status: boolean): void {
    this.sideNavBtnStatusSubject.next(status);
  }

  isSideNavMobileVisible(): boolean {
    if (window.innerWidth > 980) {
      return true;
    } else {
      return window.localStorage.getItem('sideNavMobileStatus') === 'visible';
    }
  }

  redirectToSideNav() {
    if (this.threadIsOpen === true) {
      this.closeDrawer();
      this.showSideNavOnMobileToggle.emit();
    }
    this.isSelectedForMobile = false;
    this.threadIsOpen = false;
    window.localStorage.setItem('sideNavMobileStatus', 'visible');
    window.localStorage.removeItem('closeSideNav');
  }

}
