import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Message } from '../classes/message.class';
import { Firestore, addDoc, collection, doc, getDocs, onSnapshot, query, setDoc } from '@angular/fire/firestore';
@Injectable({
  providedIn: 'root',
})
export class DrawerService {
  private isOpenSubject = new BehaviorSubject<boolean>(true);
  isOpen$ = this.isOpenSubject.asObservable();
  selectedMessageChanged: EventEmitter<Message | null> = new EventEmitter();

  constructor(private firestore:Firestore) {}

  private selectedMessage: Message | null = null;
  private selectedThreadMessagesSource = new BehaviorSubject<Message[]>([]);
  selectedThreadMessages$ = this.selectedThreadMessagesSource.asObservable();

  setSelectedMessage(message: Message): void {
    this.selectedMessage = message;
    this.selectedMessageChanged.emit(this.selectedMessage);
    // this.loadThreadMessages(message);
  }

  private async loadThreadMessages(mainMessage: Message): Promise<void> {
    if (!mainMessage.messageId) {
      console.error('Main message ID is required to load thread messages.');
      return;
    }

    const threadsRef = collection(this.firestore, `messages/${mainMessage.messageId}/threads`);
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
      console.error("Error fetching thread messages:", error);
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
  }
}
