import { Component, ElementRef, Input, ViewChild , OnInit} from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  doc,
  Firestore,
  addDoc,
  collection,
  query,
  orderBy,
  Timestamp,
  getFirestore,
  onSnapshot,
  updateDoc,
  getDoc,
  setDoc,
  DocumentSnapshot,
} from '@angular/fire/firestore';
import { Message, Thread } from '../../../classes/message.class';
import { UserListService } from '../../../firebase-services/user-list.service';
import { getStorage, ref, uploadString } from 'firebase/storage';
import { Observable } from 'rxjs';
import { DrawerService } from '../../../firebase-services/drawer.service';

@Component({
  selector: 'app-message-box-thread',
  standalone: true,
  imports: [
    MatDividerModule,
    MatTooltipModule,
    PickerModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './message-box-thread.component.html',
  styleUrl: './message-box-thread.component.scss',
})
export class MessageBoxThreadComponent implements OnInit{
  public textArea: string = '';
  public isEmojiPickerVisible: boolean = false;
  @ViewChild('emojiPicker') emojiPicker: ElementRef | undefined;
  @Input() userId!: string;
  threads: Thread[] = [];
  selectedThreadId: string | undefined;
  messageId: string | undefined;

  constructor(
    private elementRef: ElementRef,
    private firestore: Firestore,
    private userDataService: UserListService,
    private threadService:DrawerService
  ) {
    this.getUserData();
  }

  userName: string = '';
  userImage: string = '';
  selectedFile?: File;
  sendButtonDisabled: boolean = true;
  messages$!: Observable<Message[]>;
  selectedThread: Thread | null = null;
  selectedMessage: Message | null = null;
  ngOnInit(): void {
    console.log(this.userId)
      this.threadService.selectedMessageChanged.subscribe(
        (selectedMessage: Message | null) => {
          if (selectedMessage) {
            this.selectedMessage = selectedMessage;
            console.log(selectedMessage)

          }
        }
      );

  }

  getUserData(): void {
    this.userDataService.userName$.subscribe((userName) => {
      this.userName = userName;
    });
    this.userDataService.userImage$.subscribe((userImage) => {
      this.userImage = userImage;
    });
  }

  toggleEmojiPicker() {
    this.isEmojiPickerVisible = !this.isEmojiPickerVisible;
  }

  addEmoji(event: { emoji: { native: any } }) {
    this.textArea += event.emoji.native;
    this.isEmojiPickerVisible = false;
  }

  async sendMessageThread(): Promise<void> {
    try {
      this.validateMessage();
      const newThreadMessage = this.createThreadMessageFromInput();
      await this.handleFileUploadIfNeeded(newThreadMessage);
      this.clearInputFields();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  validateMessage(): void {
    if (!this.selectedMessage || !this.selectedMessage.messageId) {
      throw new Error('Selected message or message ID not available.');
    }
    if (this.textArea.trim() === '') {
      throw new Error('Empty message.');
    }
  }

  createThreadMessageFromInput(): Message {
    const newThreadMessage = new Message();
    newThreadMessage.name = this.userName;
    newThreadMessage.time = Date.now();
    newThreadMessage.message.push(this.textArea);
    newThreadMessage.senderId = this.userId || '';
    newThreadMessage.image = this.userImage;
    return newThreadMessage;
  }

  async handleFileUploadIfNeeded(newThreadMessage: Message): Promise<void> {
    if (this.selectedFile) {
      await this.uploadFile(newThreadMessage);
    }
    await this.updateOrCreateThread(newThreadMessage, this.selectedMessage!.messageId);
  }

  async uploadFile(newThreadMessage: Message): Promise<void> {
    const storageRef = ref(getStorage(), `files/${this.selectedFile!.name}`);
    const fileDataUrl = await this.readFile(this.selectedFile!);
    await uploadString(storageRef, fileDataUrl, 'data_url');
    newThreadMessage.messageImage = `files/${this.selectedFile!.name}`;
  }

  readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => resolve(fileReader.result as string);
      fileReader.onerror = () => reject(new Error('Error reading file data URL.'));
      fileReader.readAsDataURL(file);
    });
  }

  clearInputFields(): void {
    this.textArea = '';
    this.selectedFile = undefined;
  }


  generateUniquePartOfThreadId(): string {
    return `${this.userId}-${Date.now()}`;
  }

  async updateOrCreateThread(newThreadMessage: Message, messageId: string): Promise<void> {
    const messageDocRef = doc(this.firestore, 'messages', messageId);
    const messageSnapshot = await getDoc(messageDocRef);
    if (!messageSnapshot.exists()) {
      throw new Error('Message document not found.');
    }

    // Generate the unique part of the thread ID
    const uniqueThreadIdPart = this.generateUniquePartOfThreadId();
    newThreadMessage.messageId = `${messageId}-${uniqueThreadIdPart}`; // Set the full messageId for the new thread message
    newThreadMessage.senderId = this.userId || ''; // Set the senderId for the new thread message

    // Use the unique part for the thread document ID within Firestore
    const threadDocRef = doc(messageDocRef, 'threads', uniqueThreadIdPart);
    await setDoc(threadDocRef, newThreadMessage.toJson());
  }


  generateThreadId(messageId: string): string {
    // Use messageId, userId, and the current timestamp to generate a unique thread ID
    const userIdPart = `${this.userId}` ;
    return `${messageId}${userIdPart}-${Date.now()}`;
  }


  // Helper function to read file as data URL
  readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
      fileReader.readAsDataURL(file);
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }
}