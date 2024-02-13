import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PickerModule } from "@ctrl/ngx-emoji-mart";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, addDoc, collection, getFirestore } from '@angular/fire/firestore';
import { Message } from '../../classes/message.class';
import { UserListService } from '../../firebase-services/user-list.service';
import { getStorage, ref, uploadString } from 'firebase/storage';
import { Observable } from 'rxjs';
import { GetIdService } from '../../firebase-services/get-id.service';
import { FirebaseService } from '../../firebase-services/firebase.service';

@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [MatDividerModule, MatTooltipModule, PickerModule, CommonModule, FormsModule],
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss'],
})
export class MessageBoxComponent {

  public textArea: string = "";
  public isEmojiPickerVisible: boolean = false;
  @ViewChild('emojiPicker') emojiPicker: ElementRef | undefined;
  @Input() userId: string | undefined;
  constructor(
    private elementRef: ElementRef,
    private firestore: Firestore,
    private userDataService: UserListService,
    private id: GetIdService,
    private firebase: FirebaseService
  ) {
    this.getUserData();
    this.subscribeToChannelChanges();
  }

  userName: string = '';
  userImage: string = '';
  channelIds: string[] = [];
  selectedFile?: File;
  sendButtonDisabled: boolean = true;
  messages$!: Observable<Message[]>;
  private currentChannelId: string | null = null;
  getUserData(): void {
    this.userDataService.userName$.subscribe(userName => {
      this.userName = userName;
    });
    this.userDataService.userImage$.subscribe(userImage => {
      this.userImage = userImage;
    });
  }

  private subscribeToChannelChanges(): void {
    // This subscription will update the local variable whenever the selected channel changes.
    // Make sure to unsubscribe properly to avoid memory leaks, e.g., by using a takeUntil mechanism or unsubscribing in ngOnDestroy.
    this.firebase.selectedChannelId$.subscribe(channelId => {
      this.currentChannelId = channelId;
    });
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
        newMessage.message.push(this.textArea);
        newMessage.image = this.userImage;
        if (this.userId) {
          newMessage.senderId = this.userId;
        }

        console.log(this.currentChannelId);
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
      console.error('No channel selected or text area is empty.');
    }
  }





private async uploadSelectedFile(newMessage: Message, channelId: string): Promise<void> {
  try {
      const storage = getStorage();
      const storageRef = ref(storage, `files/${this.selectedFile!.name}`);
      const fileDataUrl = await this.readFileDataUrl(this.selectedFile!);

      await uploadString(storageRef, fileDataUrl, 'data_url');

      newMessage.messageImage = `files/${this.selectedFile?.name}`;

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

private async addMessageToFirestore(newMessage: Message, channelId: string): Promise<string> {
  const channelMessagesRef = collection(this.firestore, 'channels', channelId, 'channelMessages');
  const messageRef = await addDoc(channelMessagesRef, newMessage.toJson());
  return messageRef.id;
}

private clearInputFields(): void {
    this.textArea = '';
    this.selectedFile = undefined;
}

onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
}

}
