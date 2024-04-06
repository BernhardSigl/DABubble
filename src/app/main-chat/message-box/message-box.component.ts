import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Firestore,
  addDoc,
  collection,
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [
    MatDividerModule,
    MatTooltipModule,
    PickerModule,
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss'],
})
export class MessageBoxComponent implements OnInit  {
  @ViewChild('textareaRef') textareaRef!: ElementRef;
  public textArea: string = '';
  public isEmojiPickerVisible: boolean = false;
  @ViewChild('emojiPicker') emojiPicker: ElementRef | undefined;
  @Input() userId: string | undefined;
  isLoading: boolean = true;
  clickedUserIndex: number | null = null;

  constructor(
    private firestore: Firestore,
    private userDataService: UserListService,
    private firebase: FirebaseService,
    private snackbar: MatSnackBar
  ) {
    this.getUserData();
    this.subscribeToChannelChanges();
  }
  selectedFilePreview: string | undefined;
  filteredChannels: any[] = [];

  mentionedUsers: { name: string; profilePicture: string }[] = [];
  userName: string = '';
  userImage: string = '';
  channelIds: string[] = [];
  currentChannelName: string = '';
  selectedFile?: File;
  sendButtonDisabled: boolean = true;
  messages$!: Observable<Message[]>;
  private currentChannelId: string | null = null;
  getUserData(): void {
    this.userDataService.userName$.subscribe((userName) => {
      this.userName = userName;
    });
    this.userDataService.userImage$.subscribe((userImage) => {
      this.userImage = userImage;
    });
  }
  private subscribeToChannelChanges(): void {
    this.firebase.selectedChannelId$.subscribe((channelId) => {
      this.currentChannelId = channelId;
    });
  }

  async ngOnInit() {
    await this.firebase.ngOnInit();
    this.currentChannelName = this.firebase.currentChannelName;
    this.textareaRef.nativeElement.focus();
    this.isLoading = false;
  }

  toggleEmojiPicker() {
    this.isEmojiPickerVisible = !this.isEmojiPickerVisible;
  }

  addEmoji(event: { emoji: { native: any } }) {
    this.textArea += event.emoji.native;
    this.isEmojiPickerVisible = false;
  }

  async sendMessage(): Promise<void> {
    const isTextAreaNotEmpty = this.textArea.trim() !== '';
    const isFileSelected = !!this.selectedFile;

    if ((isTextAreaNotEmpty || isFileSelected) && this.currentChannelId) {
      try {
        const newMessage = new Message();
        newMessage.name = this.userName;
        newMessage.time = Date.now();
        if (isTextAreaNotEmpty) {
          newMessage.message.push(this.textArea);
        }
        newMessage.image = this.userImage;
        if (this.userId) {
          newMessage.senderId = this.userId;
        }
        if (this.selectedFile) {
          await this.uploadSelectedFile(newMessage, this.currentChannelId);
        } else {
          await this.addMessageToFirestore(newMessage, this.currentChannelId);
        }
        this.clearInputFields();
      } catch (error) {
        console.error('Error sending message:', error);
      }
    } else {
      this.snackbar.open('Cannot send empty message', '', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
      });
    }
  }

  private async uploadSelectedFile(
    newMessage: Message,
    channelId: string
  ): Promise<void> {
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `files/${this.selectedFile!.name}`);
      const fileDataUrl = await this.readFileDataUrl(this.selectedFile!);

      await uploadString(storageRef, fileDataUrl, 'data_url');

      // Get the download URL for the uploaded file
      const downloadURL = await getDownloadURL(storageRef);

      newMessage.messageImage = downloadURL; // Set the download URL to the message

      const messageId = await this.addMessageToFirestore(newMessage, channelId);
      newMessage.messageId = messageId;
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

  private async addMessageToFirestore(
    newMessage: Message,
    channelId: string
  ): Promise<string> {
    const channelMessagesRef = collection(
      this.firestore,
      'channels',
      channelId,
      'channelMessages'
    );
    const messageRef = await addDoc(channelMessagesRef, newMessage.toJson());
    return messageRef.id;
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

  // mention User

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
    // Handle channel selection
    const selectedChannel = this.filteredChannels[index];
    const channelName = selectedChannel.channelName;
    this.textArea = this.textArea.replace(`#${channelName}`, ''); // Remove channel hashtag from the textarea
    this.textArea += `${channelName} `;
    this.filteredChannels = []; // Clear filtered channels after selection
  }

  suggestChannels() {
    if (this.textArea.includes('#')) {
      const searchTerm = this.textArea
        .toLowerCase()
        .slice(this.textArea.lastIndexOf('#') + 1);
      this.filteredChannels = this.firebase.channelsArray.filter((channel) =>
        channel.channelName.toLowerCase().includes(searchTerm)

      );
      console.log(this.filteredChannels)
    } else {
      this.filteredChannels = [];
    }
  }
}
