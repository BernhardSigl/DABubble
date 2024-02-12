import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PickerModule } from "@ctrl/ngx-emoji-mart";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, addDoc, collection, query, orderBy, Timestamp, getFirestore, onSnapshot } from '@angular/fire/firestore';
import { Message } from '../../classes/message.class';
import { UserListService } from '../../firebase-services/user-list.service';
import { getStorage, ref, uploadString } from 'firebase/storage';
import { Observable } from 'rxjs';

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
  ) {
    this.getUserData();
  }

  userName: string = '';
  userImage: string = '';
  selectedFile?: File;
  sendButtonDisabled: boolean = true;
  messages$!: Observable<Message[]>;

  getUserData(): void {
    this.userDataService.userName$.subscribe(userName => {
      this.userName = userName;
    });
    this.userDataService.userImage$.subscribe(userImage => {
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

  async sendMessage(): Promise<void> {
    const isTextAreaNotEmpty = this.textArea.trim() !== '';
    const isFileSelected = !!this.selectedFile;

    if ((isTextAreaNotEmpty || isFileSelected) && (this.textArea !== '' || isFileSelected)) {
        try {
            const newMessage = new Message();
            newMessage.name = this.userName;
            newMessage.time = Date.now();
            newMessage.message.push(this.textArea);
            newMessage.image = this.userImage;

            if (this.userId) {
                newMessage.senderId = this.userId;
            }

            if (this.selectedFile) {
                await this.uploadSelectedFile(newMessage);
            } else {
                await this.addMessageToFirestore(newMessage);
            }

            this.clearInputFields();

        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
}

private async uploadSelectedFile(newMessage: Message): Promise<void> {
  try {
      const storage = getStorage();
      const storageRef = ref(storage, `files/${this.selectedFile!.name}`);
      const fileDataUrl = await this.readFileDataUrl(this.selectedFile!);

      await uploadString(storageRef, fileDataUrl, 'data_url');

      newMessage.messageImage = `files/${this.selectedFile?.name}`;

      const messageId = await this.addMessageToFirestore(newMessage);
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

private async addMessageToFirestore(newMessage: Message): Promise<string> {
    const messageRef = await addDoc(collection(this.firestore, 'messages'), newMessage.toJson());
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
