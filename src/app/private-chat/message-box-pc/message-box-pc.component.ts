import { Component, ElementRef, ViewChild } from '@angular/core';
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
import { PrivateMessage } from '../../classes/private-message.class';
import { PrivateMessageService } from '../../firebase-services/private-message.service';
import { FirebaseService } from '../../firebase-services/firebase.service';

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
  styleUrls: ['./message-box-pc.component.scss'],
})
export class MessageBoxPcComponent {
  @ViewChild('textareaRef') textareaRef!: ElementRef;
  public textArea: string = '';
  public isEmojiPickerVisible: boolean = false;
  @ViewChild('emojiPicker') emojiPicker: ElementRef | undefined;

  constructor(
    private firestore: Firestore,
    private privateMessageService: PrivateMessageService,
  ) {}

  userId: string | null = null;
  userName: string = '';
  userImage: string = '';
  selectedFile?: File;
  messages$!: Observable<Message[]>;
  private currentPrivateMessageId: string | null = null;
  chatUserName:string='';

  async ngOnInit() {
    this.userId = localStorage.getItem('userId');
    if (this.userId) {
      await this.fetchUserDetails(this.userId);
    }
    this.subscribeToSelectedPrivateMessage();
    this.textareaRef.nativeElement.focus();
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
        this.chatUserName = privateMessage?.members[0].name
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
      if (this.textArea.trim() || this.selectedFile) {
        const newMessage = new Message();
        newMessage.senderId = this.userId;
        newMessage.message = [this.textArea.trim()];
        newMessage.time = Date.now();
        newMessage.name = this.userName;
        newMessage.image = this.userImage;

        const messagesCollectionPath = `privateMessages/${this.currentPrivateMessageId}/messages`;

        if (this.selectedFile) {
          await this.uploadSelectedFile(newMessage, messagesCollectionPath);
        } else {
          await addDoc(
            collection(this.firestore, messagesCollectionPath),
            newMessage.toJson()
          );
        }

        this.clearInputFields();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  private async uploadSelectedFile(
    newMessage: Message,
    messagesCollectionPath: string
  ): Promise<void> {
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `files/${this.selectedFile!.name}`);
      const fileDataUrl = await this.readFileDataUrl(this.selectedFile!);

      await uploadString(storageRef, fileDataUrl, 'data_url');

      // Get the download URL for the uploaded file
      const downloadURL = await getDownloadURL(storageRef);

      newMessage.messageImage = downloadURL; // Set the download URL to the message

      await addDoc(collection(this.firestore, messagesCollectionPath), newMessage.toJson());
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error; // Re-throw the error to propagate it upwards
    }
  }

  private async readFileDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        resolve(fileReader.result as string);
      };
      fileReader.onerror = reject;
      fileReader.readAsDataURL(file);
    });
  }

  private clearInputFields(): void {
    this.textArea = '';
    this.selectedFile = undefined;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }
}
