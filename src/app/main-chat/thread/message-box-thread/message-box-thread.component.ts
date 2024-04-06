import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  doc,
  Firestore,
  getDoc,
  setDoc
} from '@angular/fire/firestore';
import { Message, Thread } from '../../../classes/message.class';
import { UserListService } from '../../../firebase-services/user-list.service';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadString,
} from 'firebase/storage';
import { Observable } from 'rxjs';
import { DrawerService } from '../../../firebase-services/drawer.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FirebaseService } from '../../../firebase-services/firebase.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-message-box-thread',
  standalone: true,
  imports: [
    MatDividerModule,
    MatTooltipModule,
    PickerModule,
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './message-box-thread.component.html',
  styleUrl: './message-box-thread.component.scss',
})
export class MessageBoxThreadComponent implements OnInit {
  public textArea: string = '';
  public isEmojiPickerVisible: boolean = false;
  @ViewChild('emojiPicker') emojiPicker: ElementRef | undefined;
  @Input() userId!: string;
  threads: Thread[] = [];
  selectedThreadId: string | undefined;
  messageId: string | undefined;
  public selectedChannelId: string | undefined;
  selectedFilePreview: string | undefined;
  isLoading: boolean = false;
  mentionedUsers: { name: string; profilePicture: string }[] = [];
  filteredChannels: any[] = [];
  @Output() threadIdEmitter: EventEmitter<string> = new EventEmitter<string>();


  constructor(
    private firestore: Firestore,
    private userDataService: UserListService,
    private threadService: DrawerService,
    private snackBar: MatSnackBar,
    private firebase:FirebaseService
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
    this.threadService.selectedMessageChanged.subscribe(
      (selectedMessage: Message | null) => {
        if (selectedMessage) {
          this.selectedMessage = selectedMessage;
        }
      }
    );
  this.firebase.selectedChannelId$.subscribe(channelId => {
    if (channelId !== null) {
      this.selectedChannelId = channelId;
    } else {
      this.selectedChannelId = undefined;
    }
  });   
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
    this.isLoading = true;
    try {
      this.validateMessage();
      const newThreadMessage = this.createThreadMessageFromInput();
      await this.handleFileUploadIfNeeded(newThreadMessage);
      this.clearInputFields();
    } catch (error) {
      this.snackBar.open('Bitte Nachricht eingeben', '', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
      });
    }
    this.isLoading = false;
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
    const isTextAreaNotEmpty = this.textArea.trim() !== '';
    const newThreadMessage = new Message();
    newThreadMessage.name = this.userName;
    newThreadMessage.time = Date.now();
    if (isTextAreaNotEmpty) {
      newThreadMessage.message.push(this.textArea);
    }
    newThreadMessage.senderId = this.userId || '';
    newThreadMessage.image = this.userImage;
    return newThreadMessage;
  }

  async handleFileUploadIfNeeded(newThreadMessage: Message): Promise<void> {
    if (this.selectedFile) {
      const downloadURL = await this.uploadFile(newThreadMessage);
      newThreadMessage.messageImage = downloadURL; // Set the download URL in the message
    }
    await this.updateOrCreateThread(
      newThreadMessage,
      this.selectedMessage!.messageId
    );
    // Emit the threadId received from the child component
    this.threadIdEmitter.emit(newThreadMessage.messageId);

    // Emit the threadId to the parent component
    this.threadIdEmitter.emit(newThreadMessage.messageId);
  }

  async uploadFile(newThreadMessage: Message): Promise<string> {
    const storage = getStorage();
    const storageRef = ref(storage, `files/${this.selectedFile!.name}`);
    const fileDataUrl = await this.readFile(this.selectedFile!);
    await uploadString(storageRef, fileDataUrl, 'data_url');
    const downloadURL = await getDownloadURL(storageRef); // Get the download URL of the uploaded file
    newThreadMessage.messageImage = downloadURL; // Set the download URL in the message
    return downloadURL; // Return the download URL
  }

  readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => resolve(fileReader.result as string);
      fileReader.onerror = () =>
        reject(new Error('Error reading file data URL.'));
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
    if (!this.selectedChannelId) {
      throw new Error('Channel ID is not selected.');
    }

    const messageDocRef = doc(this.firestore, `channels/${this.selectedChannelId}/channelMessages/${messageId}`);
    const messageSnapshot = await getDoc(messageDocRef);
    if (!messageSnapshot.exists()) {
      throw new Error('Message document not found.');
    }

    const uniqueThreadIdPart = this.generateUniquePartOfThreadId();
    newThreadMessage.messageId = `${uniqueThreadIdPart}`;
    newThreadMessage.senderId = this.userId || '';

    const threadDocRef = doc(messageDocRef, 'Thread', uniqueThreadIdPart);
    await setDoc(threadDocRef, newThreadMessage.toJson());
  }


  generateThreadId(messageId: string): string {
    // Use messageId, userId, and the current timestamp to generate a unique thread ID
    const userIdPart = `${this.userId}`;
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
    this.updateSelectedFilePreview();
  }

  private updateSelectedFilePreview() {
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFilePreview = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onTextAreaChange() {
    this.suggestUsers();
    this.suggestChannels();
  }

  suggestUsers() {
    if (this.textArea.includes('@')) {
      this.mentionedUsers = this.firebase.usersArray
        .filter(user =>
          user.name.toLowerCase().includes(
            this.textArea
              .toLowerCase()
              .slice(this.textArea.lastIndexOf('@') + 1)
          )
        )
        .map(user => ({
          name: user.name,
          profilePicture: user.profileImg,
        }));
    } else {
      this.mentionedUsers = [];
    }
  }

  selectMention(index: number) {
    // Handle mention selection
    // Insert the selected mention into the textarea
    const mentionedUser = this.mentionedUsers[index];
    this.textArea = this.textArea.replace(`@${mentionedUser.name}`, ''); // Remove mention from the textarea
    this.textArea += `${mentionedUser.name} `;
    this.mentionedUsers = []; // Clear mentioned users after selection
  }

  addMention() {
    // Add '@' to the text area
    this.textArea += '@';
    this.suggestUsers();
    this.onTextAreaChange();
  }

  selectChannel(index: number) {
    const selectedChannel = this.filteredChannels[index];
    const channelName = selectedChannel.channelName;
    this.textArea = this.textArea.replace(`#${channelName}`, '');
    this.textArea += `${channelName} `;
    this.filteredChannels = [];
  }

  suggestChannels() {
    if (this.textArea.includes('#')) {
      const searchTerm = this.textArea
        .toLowerCase()
        .slice(this.textArea.lastIndexOf('#') + 1);
      this.filteredChannels = this.firebase.channelsArray.filter((channel) =>
        channel.channelName.toLowerCase().includes(searchTerm)

      );
    } else {
      this.filteredChannels = [];
    }
  }
}
