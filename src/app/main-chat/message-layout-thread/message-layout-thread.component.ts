import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MainChatComponent } from '../main-chat.component';
import {
  Firestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { Message } from '../../classes/message.class';
import { CommonModule } from '@angular/common';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { user } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { DrawerService } from '../../firebase-services/drawer.service';
import { MessageBoxThreadComponent } from '../thread/message-box-thread/message-box-thread.component';

@Component({
  selector: 'app-message-layout-thread',
  standalone: true,
  imports: [
    MatDividerModule,
    MainChatComponent,
    CommonModule,
    PickerModule,
    FormsModule,
    MessageLayoutThreadComponent,
    MatDividerModule,
  ],
  templateUrl: './message-layout-thread.component.html',
  styleUrl: './message-layout-thread.component.scss',
})
export class MessageLayoutThreadComponent implements OnInit {
  @Input() userId?: string;
  constructor(
    private threadService: DrawerService,
    private firestore: Firestore,

  ) {}
  selectedMessage: Message | null = null;
  threadMessages: Message[] = [];
  public isEditEnabled: { [key: string]: boolean } = {};
  public editedMessage: { [key: string]: string } = {};
  public isEditingEnabled: { [key: string]: boolean } = {};
  public isEmojiPickerVisible: { [key: string]: boolean } = {};
  public isHovered: { [key: string]: boolean } = {};
  public textArea: string = '';
  @ViewChild('emojiPicker') emojiPicker: ElementRef | undefined;
  private messagesSubject: BehaviorSubject<Message[]> = new BehaviorSubject<
    Message[]
  >([]);
  messages$: Observable<Message[]> = this.messagesSubject.asObservable();
  @Input() threadId: string = '';

  ngOnInit() {
    this.threadService.selectedMessageChanged.subscribe(
      (selectedMessage: Message | null) => {
        if (selectedMessage) {
          this.selectedMessage = selectedMessage;
          this.fetchThreadMessages(selectedMessage.messageId);
        }
      }
    );


  }




  fetchThreadMessages(messageId: string): void {
    const threadsRef = collection(
      this.firestore,
      `messages/${messageId}/threads`
    );
    const q = query(threadsRef, orderBy('time')); // Assuming you have a 'time' field for ordering

    onSnapshot(
      q,
      (querySnapshot) => {
        this.threadMessages = [];
        querySnapshot.forEach((doc) => {
          const message = { messageId: doc.id, ...doc.data() } as Message; // Add the doc.id as messageId if needed
          this.threadMessages.push(message);
        });
      },
      (error) => {
        console.error('Error fetching thread messages:', error);
      }
    );
  }

  toggleEmojiPicker(messageId: string) {
    if (!this.isEmojiPickerVisible[messageId]) {
      Object.keys(this.isEmojiPickerVisible).forEach((key) => {
        this.isEmojiPickerVisible[key] = false;
      });
    }
    this.isEmojiPickerVisible[messageId] =
      !this.isEmojiPickerVisible[messageId];
  }

  onEmojiClick(event: any, message: Message) {
    this.addReactionThread(message, event.emoji.native);
  }

  async addReactionThread(message: Message, emoji: string) {
    if (!message || !emoji) {
        console.error('Message or emoji is undefined');
        return;
    }

    message.reactions = message.reactions || {}; // Ensure reactions object exists

    message.reactions[emoji] = (message.reactions[emoji] || 0) + 1; // Increment reaction count

    await this.updateReactionsInFirestore(message);
}

async updateReactionsInFirestore(message: Message) {
  console.log(message.messageId)
  try {
      const threadDocRef = doc(this.firestore, `messages/${message.messageId}/threads/${message.threadId}`);
      await setDoc(threadDocRef, {
          reactions: message.reactions // Update only reactions field
      }, { merge: true });
      console.log('Reactions updated successfully in Firestore');
  } catch (error) {
      console.error('Error updating reactions in Firestore:', error);
  }
}

  closeEmojiPicker(messageId: string) {
    this.isEmojiPickerVisible[messageId] = false;
  }





  getMessageText(messageId: string): Observable<string> {
    return this.messages$.pipe(
      map((messages) => {
        const message = messages.find((m) => m.messageId === messageId);
        return message ? message.message.join('\n') : '';
      })
    );
  }
}
