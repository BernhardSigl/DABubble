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
import { GetIdService } from '../../firebase-services/get-id.service';
import { FirebaseService } from '../../firebase-services/firebase.service';

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
    private id:GetIdService,
    private firebase:FirebaseService
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
  messageId: string = '';
  selectedChannelId?: string;

  ngOnInit() {
    this.threadService.selectedMessageChanged.subscribe(
      (selectedMessage: Message | null) => {
        if (selectedMessage) {
          this.selectedMessage = selectedMessage;
          this.fetchThreadMessages(selectedMessage.messageId);
          this.messageId = selectedMessage.messageId;
        }
      }
    );
    this.firebase.selectedChannelId$.subscribe(channelId => {

      if (channelId !== null) {
        this.selectedChannelId = channelId; // This will now only assign non-null values
        console.log(channelId);
      } else {
        // Handle the null case explicitly, e.g., reset selectedChannelId or take other appropriate action
        this.selectedChannelId = undefined; // or set to a default/fallback value if suitable
      }
    });
  }




  fetchThreadMessages(messageId: string): void {
    const threadsRef = collection(this.firestore, `channels/${this.selectedChannelId}/channelMessages/${messageId}/Thread`);
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
    this.isEmojiPickerVisible[messageId] = !this.isEmojiPickerVisible[messageId];
  }

  onEmojiClick(event: any, message: Message) {
    this.addReactionThread(message, event.emoji.native);
  }

  toggleReactionThread(message: Message, emoji: string) {
    if (!this.userId) {
      console.error('UserID is not defined.');
      return;
    }

    const userId = this.userId;

    if (message.reactions && message.reactions[emoji]) {
      if (message.senderId === userId && message.reactions[emoji] > 0) {
        message.reactions[emoji]--; // Decrease count if same user reacts with the same emoji
      } else {
        message.reactions[emoji]++; // Increase count if different user reacts or same user reacts differently
      }

      if (message.reactions[emoji] === 0) {
        delete message.reactions[emoji]; // Delete the reaction if count becomes 0
      }
    } else {
      if (!message.reactions) {
        message.reactions = {};
      }
      message.reactions[emoji] = 1; // Initialize count if emoji is reacted for the first time
    }

    this.updateReactionsInFirestore(message);
  }



async addReactionThread(message: Message, emoji: string) {
  if (!message || !emoji) {
    console.error('Message or emoji is undefined');
    return;
  }

  message.reactions = message.reactions || {}; // Ensure reactions object exists

  message.reactions[emoji] = (message.reactions[emoji] || 0) + 1; // Increment reaction count

  await this.updateReactionsInFirestore(message);
  this.closeEmojiPicker(message.messageId);
}

async updateReactionsInFirestore(message: Message) {
  try {
    const threadDocRef = doc(this.firestore, `channels/${this.selectedChannelId}/channelMessages/${this.messageId}/Thread/${message.messageId}`);
    await setDoc(threadDocRef, { reactions: message.reactions }, { merge: true });
    console.log('Reactions updated successfully in Firestore');
  } catch (error) {
    console.error('Error updating reactions in Firestore:', error);
  }
}

  closeEmojiPicker(messageId: string) {
    this.isEmojiPickerVisible[messageId] = false;
  }


  toggleEditMessageThread(messageId: string): void {
    // Set editing enabled state to true for "Nachricht Bearbeiten"
    this.isEditingEnabled[messageId] = true;

    // Reset the edited message content when toggling edit mode
    this.editedMessage[messageId] = '';
  }

  toggleToTextArea(messageId: string): void {
    // Set edit enabled state to true
    this.isEditEnabled[messageId] = true;
    // Subscribe to the Observable returned by getMessageText
    this.getMessageText(messageId).subscribe((messageText) => {
      // Assign the message text to editedMessage[messageId]
      this.editedMessage[messageId] = messageText;
    });
    this.isEditingEnabled[messageId] = false;

  }

  saveEditedMessageThread(messageId: string, editedText: string): void {
    // Update the message in the Firebase Firestore
    // Assuming you have a way to identify the thread message document
    const messageRef = doc(this.firestore, `messages/${this.messageId}/threads/${messageId}`);
    setDoc(messageRef, { message: editedText.split('\n') }, { merge: true })
      .then(() => {
        console.log('Message successfully updated.');
        // Disable edit mode after saving
        this.toggleEditMessageThread(messageId);
        this.isEditEnabled[messageId] = false;
        this.isEditingEnabled[messageId] = false;
      })
      .catch((error) => {
        console.error('Error updating message:', error);
      });

  }


  cancelEditThread(messageId: string): void {
    // Disable edit mode and reset the edited message content
    this.isEditEnabled[messageId] = false;
    this.editedMessage[messageId] = '';
    this.isEditingEnabled[messageId] = false;
  }



  getMessageText(messageId: string): Observable<string> {
    return this.messages$.pipe(
      map((messages) => {
        const message = this.threadMessages.find((m) => m.messageId === messageId);
        return message ? message.message.join('\n') : '';
      })
    );
  }



}
