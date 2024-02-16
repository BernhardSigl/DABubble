import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import {
  Firestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  getDocs,
  where,
  limit,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { Message } from '../../classes/message.class';
import { CommonModule } from '@angular/common';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { user } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { GetIdService } from '../../firebase-services/get-id.service';
import { MatDrawer } from '@angular/material/sidenav';
import { DrawerService } from '../../firebase-services/drawer.service';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { LocalStorage } from 'ngx-webstorage';
import { PrivateMessageService } from '../../firebase-services/private-message.service';
@Component({
  selector: 'app-message-layout-pc',
  standalone: true,
  imports: [
    MatDividerModule,
    CommonModule,
    PickerModule,
    FormsModule,
    MatDrawer,
  ],
  templateUrl: './message-layout-pc.component.html',
  styleUrl: './message-layout-pc.component.scss',
})
export class MessageLayoutPcComponent {
  @Input() userId: string | null = null;
  @Input() userName!: string;
  @Input() userImage!: string;
  @Input() privateMessageId!: string;
  @ViewChild('drawer') drawer!: MatDrawer;

  isHovered: { [key: string]: boolean } = {};
  public textArea: string = '';
  public isEmojiPickerVisible: { [key: string]: boolean } = {};
  public isEditingEnabled: { [key: string]: boolean } = {};
  public isEditEnabled: { [key: string]: boolean } = {};
  public editedMessage: { [key: string]: string } = {};
  public selectedMessage: Message | null = null;
  public channelDoc: any;

  private messagesSubject: BehaviorSubject<Message[]> = new BehaviorSubject<
    Message[]
  >([]);
  messages$: Observable<Message[]> = this.messagesSubject.asObservable();
  @ViewChild('emojiPicker') emojiPicker: ElementRef | undefined;
  constructor(
    private firestore: Firestore,
    private firebase: FirebaseService,
    private privateMessage:PrivateMessageService
  ) {}

  ngOnInit() {
    this.privateMessage.userSelected.subscribe(({ user, privateMessageId }) => {
      console.log('Received user and message ID:', user, privateMessageId);
      this.privateMessageId = privateMessageId;

      this.loadMessages();
    });
    this.userId = localStorage.getItem('userId');

  }

  loadMessages(): void {
    if (!this.userId || !this.privateMessageId) {
      console.error('User ID or Private Message ID is missing.');
      return;
    }

    const messagesCollectionPath = `privateMessages/${this.privateMessageId}/messages`;

    const q = query(
      collection(this.firestore, messagesCollectionPath),
      orderBy('time', 'asc') // Order messages by time
    );

    onSnapshot(q, (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        messages.push(doc.data() as Message);
      });
      this.messagesSubject.next(messages);
    });
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
    console.log('Selected emoji:', event.emoji.native);
    this.addReaction(message, event.emoji.native);
  }

  addReaction(message: Message, emoji: string) {
    if (!message.reactions) {
      message.reactions = {};
    }

    if (!emoji) {
      console.error('Selected emoji is undefined');
      return;
    }

    if (!message.reactions[emoji]) {
      message.reactions[emoji] = 1;
    } else {
      message.reactions[emoji]++;
    }

    // this.updateMessageReactions(this.selectedChannelId!, message);

    this.closeEmojiPicker(message.messageId);
  }

  closeEmojiPicker(messageId: string) {
    this.isEmojiPickerVisible[messageId] = false;
  }

  toggleReaction(message: Message, emoji: string) {
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
    } else {
      if (!message.reactions) {
        message.reactions = {};
      }
      message.reactions[emoji] = 1; // Initialize count if emoji is reacted for the first time
    }

    // this.updateMessageReactions(this.selectedChannelId!, message);
  }

  updateMessageReactions(channelId: string, message: Message) {
    console.log(channelId);
    // Construct the correct path using the provided channelId
    const messageRef = doc(
      this.firestore,
      `channels/${channelId}/channelMessages`,
      message.messageId
    );
    const reactionsData = message.reactions || {};

    setDoc(messageRef, { reactions: reactionsData }, { merge: true })
      .then(() => {
        console.log('Reactions successfully updated.');
      })
      .catch((error) => {
        console.error('Error updating reactions:', error);
      });
  }

  toggleHoverOptions(messageId: string, value: boolean): void {
    this.isHovered[messageId] = value;

    if (!value && this.isEditingEnabled[messageId]) {
      this.isEditingEnabled[messageId] = false;
    }
  }

  toggleEditMessage(messageId: string): void {
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

  // saveEditedMessage( message: Message): void {
  //   console.log(message.messageId)
  //   const editedText = this.editedMessage[message.messageId];

  //   // Update the message in the Firebase Firestore
  //   // const messageRef = doc(this.firestore, `channels/${channelId}/channelMessages`, message.messageId);
  //   // setDoc(messageRef, { message: editedText.split('\n') }, { merge: true })
  //     .then(() => {
  //       console.log('Message successfully updated.');
  //       // Disable edit mode after saving
  //       this.toggleEditMessage(message.messageId);
  //       this.isEditingEnabled[message.messageId] = false;
  //     })
  //     .catch((error) => {
  //       console.error('Error updating message:', error);
  //     });
  //       this.isEditEnabled[message.messageId] = false;
  //       this.isEditingEnabled[message.messageId] = false;
  // }

  cancelEdit(messageId: string): void {
    this.isEditEnabled[messageId] = false;

    this.isHovered[messageId] = false;
    this.isEditingEnabled[messageId] = false;
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
