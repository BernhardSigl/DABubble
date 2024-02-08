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
  ],
  templateUrl: './message-layout-thread.component.html',
  styleUrl: './message-layout-thread.component.scss',
})
export class MessageLayoutThreadComponent implements OnInit {
  @Input() userId?: string;
  @Input() userName!: string;
  @Input() userImage!: string;
  @Output() messageSelected: EventEmitter<Message> = new EventEmitter<Message>();

  private messagesSubject: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);
  messages$: Observable<Message[]> = this.messagesSubject.asObservable();
  isHovered: { [key: string]: boolean } = {};
  public isEmojiPickerVisible: { [key: string]: boolean } = {};
  public isEditingEnabled: { [key: string]: boolean } = {};
  public isEditEnabled: { [key: string]: boolean } = {};
  public editedMessage: { [key: string]: string } = {};
  selectedMessage: Message | null = null;

  constructor(private firestore: Firestore) {}

  ngOnInit(): void {}

  openThreadView(message: Message): void {
    console.log(message)
    this.selectedMessage = message;
    this.messageSelected.emit(message);
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

    this.updateMessageReactions(message);
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
      if (message.senderId === userId) {
        if (message.reactions[emoji] === 1) {
          delete message.reactions[emoji];
        } else {
          message.reactions[emoji]--;
        }
      } else {
        message.reactions[emoji]++;
      }
    } else {
      if (!message.reactions) {
        message.reactions = {};
      }
      message.reactions[emoji] = message.senderId === userId ? 1 : 1;
    }

    this.updateMessageReactions(message);
  }

  updateMessageReactions(message: Message) {
    const messageRef = doc(this.firestore, 'messages', message.messageId);
    const reactionsData = message.reactions || {};

    setDoc(messageRef, { reactions: reactionsData }, { merge: true });
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
    this.isEditingEnabled[messageId] = true;
  }

  saveEditedMessage(message: Message, messageId: string): void {
    const editedText = this.editedMessage[message.messageId];

    // Update the message in the Firebase Firestore
    const messageRef = doc(this.firestore, 'messages', message.messageId);
    setDoc(messageRef, { message: editedText.split('\n') }, { merge: true })
      .then(() => {
        console.log('Message successfully updated.');
        // Disable edit mode after saving
        this.toggleEditMessage(message.messageId);
      })
      .catch((error) => {
        console.error('Error updating message:', error);
      });
    this.isEditEnabled[messageId] = false;
    this.isEditingEnabled[messageId] = false;
  }

  cancelEdit(messageId: string): void {
    this.isEditEnabled[messageId] = false;

    this.isHovered[messageId] = false;
    this.isEditingEnabled[messageId] = true;
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