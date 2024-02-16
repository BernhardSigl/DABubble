import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Firestore,
  addDoc,
  collection,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
} from '@angular/fire/firestore';
import { Message } from '../../classes/message.class';
import { UserListService } from '../../firebase-services/user-list.service';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadString,
} from 'firebase/storage';
import { Observable } from 'rxjs';
import { GetIdService } from '../../firebase-services/get-id.service';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { PrivateMessage } from '../../classes/private-message.class';
import { PrivateMessageService } from '../../firebase-services/private-message.service';
import { LocalStorage } from 'ngx-webstorage';

@Component({
  selector: 'app-message-box-pc',
  standalone: true,
  imports: [
    MatDividerModule,
    MatTooltipModule,
    PickerModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './message-box-pc.component.html',
  styleUrl: './message-box-pc.component.scss',
})
export class MessageBoxPcComponent {
  public textArea: string = '';
  public isEmojiPickerVisible: boolean = false;
  @ViewChild('emojiPicker') emojiPicker: ElementRef | undefined;

  constructor(
    private elementRef: ElementRef,
    private firestore: Firestore,
    private userDataService: UserListService,
    private id: GetIdService,
    private privateMessageService: PrivateMessageService,
    private firebase: FirebaseService,

  ) {
  }
  userId: string | null = null;
  userName: string = '';
  userImage: string = '';
  selectedFile?: File;
  sendButtonDisabled: boolean = true;
  messages$!: Observable<Message[]>;
  private currentChannelId: string | null = null;
  private currentPrivateMessageId: string | null = null;
  private privateMessagesArray: PrivateMessage[] = [];
  loggedInUserId: string | undefined;

  ngOnInit() {
    this.userId = localStorage.getItem('userId');
    this.subscribeToSelectedPrivateMessage();
  }

  private subscribeToSelectedPrivateMessage(): void {
    this.privateMessageService.selectedPrivateMessage$.subscribe(
      (privateMessage) => {
        this.currentPrivateMessageId = privateMessage
          ? privateMessage.privateMessageId
          : null;
      }
    );
  }

  toggleEmojiPicker() {
    this.isEmojiPickerVisible = !this.isEmojiPickerVisible;
  }

  addEmoji(event: { emoji: { native: any } }) {
    this.textArea += event.emoji.native;
    this.isEmojiPickerVisible = false;
  }

  async sendMessage(): Promise<void> {
    if (!this.currentPrivateMessageId || !this.userId) {
      console.error('No private message selected or user ID not found.');
      return;
    }

    try {
      const messageContent = this.textArea.trim();
      if (messageContent) {
        const newMessage = new Message();
        newMessage.senderId = this.userId;
        newMessage.message = [messageContent];
        newMessage.time = Date.now();
        newMessage.messageId = this.currentPrivateMessageId

        const messagesCollectionPath = `privateMessages/${this.currentPrivateMessageId}/messages`;

        await addDoc(collection(this.firestore, messagesCollectionPath), newMessage.toJson());

        this.clearInputFields();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }


  private clearInputFields(): void {
    this.textArea = '';
    this.selectedFile = undefined;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }
}
