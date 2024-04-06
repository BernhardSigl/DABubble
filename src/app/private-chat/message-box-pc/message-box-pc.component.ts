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
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadString,
} from 'firebase/storage';
import { Observable } from 'rxjs';
import { PrivateMessageService } from '../../firebase-services/private-message.service';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-message-box-pc',
  standalone: true,
  imports: [
    MatDividerModule,
    MatTooltipModule,
    PickerModule,
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './message-box-pc.component.html',
  styleUrls: ['./message-box-pc.component.scss'],
})
export class MessageBoxPcComponent {
  @ViewChild('textareaRef') textareaRef!: ElementRef;
  public textArea: string = '';
  public isEmojiPickerVisible: boolean = false;
  @ViewChild('emojiPicker') emojiPicker: ElementRef | undefined;

  filteredChannels: any[] = [];

  isLoading: boolean = false;


  constructor(
    private firestore: Firestore,
    private privateMessageService: PrivateMessageService,

    private firebase: FirebaseService,


    private snackBar: MatSnackBar

  ) {}

  mentionedUsers: { name: string; profilePicture: string }[] = [];
  selectedFilePreview: string | undefined;
  userId: string | null = null;
  userName: string = '';
  userImage: string = '';
  selectedFile?: File;
  messages$!: Observable<Message[]>;
  private currentPrivateMessageId: string | null = null;
  chatUserName: string = '';

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
        this.chatUserName = privateMessage?.members[0].name;
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
      return;
    }
    const isTextAreaNotEmpty = this.textArea.trim() !== '';
    try {
      if (this.textArea.trim() || this.selectedFile) {
        this.isLoading = true;
        const newMessage = new Message();
        newMessage.senderId = this.userId;
        if (isTextAreaNotEmpty) {
          newMessage.message.push(this.textArea);
        }
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
        this.isLoading = false;
      } else {
        this.snackBar.open('Bitte Nachricht eingeben', '', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
        });
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

      await addDoc(
        collection(this.firestore, messagesCollectionPath),
        newMessage.toJson()
      );
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

  selectMention(index: number) {
    // Handle mention selection
    // Insert the selected mention into the textarea
    const mentionedUser = this.mentionedUsers[index];
    this.textArea = this.textArea.replace(`@${mentionedUser.name}`, ''); // Remove mention from the textarea
    this.textArea += `${mentionedUser.name} `;
    this.mentionedUsers = []; // Clear mentioned users after selection
  }

  selectChannel(index: number) {
    // Handle channel selection
    const selectedChannel = this.filteredChannels[index];
    const channelName = selectedChannel.channelName;
    this.textArea = this.textArea.replace(`#${channelName}`, ''); // Remove channel hashtag from the textarea
    this.textArea += `${channelName} `;
    this.filteredChannels = []; // Clear filtered channels after selection
  }

  addMention() {
    // Add '@' to the text area
    this.textArea += '@';
    this.suggestUsers();
    this.suggestChannels();
    this.onTextAreaChange();
  }
  suggestUsers() {
    if (this.textArea.includes('@')) {
      this.mentionedUsers = this.firebase.usersArray
        .filter((user) =>
          user.name
            .toLowerCase()
            .includes(
              this.textArea
                .toLowerCase()
                .slice(this.textArea.lastIndexOf('@') + 1)
            )
        )
        .map((user) => ({
          name: user.name,
          profilePicture: user.profileImg,
        }));
    } else {
      this.mentionedUsers = [];
    }
  }

  onTextAreaChange() {
    this.suggestUsers();
    this.suggestChannels();
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
