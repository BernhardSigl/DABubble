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
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  updateDoc,
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
    private firebase: FirebaseService
  ) {}
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

  async ngOnInit() {
    this.userId = localStorage.getItem('userId');

    if (this.userId) {
      await this.fetchUserDetails(this.userId);
    }
    this.subscribeToSelectedPrivateMessage();
  }

  private async fetchUserDetails(userId: string): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      this.userName = userData['name'];
      this.userImage = userData['profileImg'];
    } else {
      console.log('No such document!');
    }
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
            newMessage.name = this.userName;
            newMessage.image = this.userImage;

            const messagesCollectionPath = `privateMessages/${this.currentPrivateMessageId}/messages`;

            const docRef = await addDoc(
                collection(this.firestore, messagesCollectionPath),
                newMessage.toJson()
            );

            // Retrieve the ID of the newly created document
            const newMessageId = docRef.id;
            newMessage.messageId = newMessageId;

            // Update the message with the actual ID
            await updateDoc(doc(this.firestore, `${messagesCollectionPath}/${newMessageId}`), {
                messageId: newMessageId
            });

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
