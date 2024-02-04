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
    if ((this.textArea.trim() !== '' || this.selectedFile) && (this.textArea !== '' || this.selectedFile)) {
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
                const storage = getStorage();
                const storageRef = ref(storage, `files/${this.selectedFile.name}`);

                const fileReader = new FileReader();
                fileReader.onload = async (event) => {
                    try {
                        const fileDataUrl = event.target?.result as string;

                        await uploadString(storageRef, fileDataUrl, 'data_url');

                        newMessage.messageImage = `files/${this.selectedFile?.name}`;

                        // Add the message to Firestore and retrieve the generated ID
                        const messageRef = await addDoc(collection(this.firestore, 'messages'), newMessage.toJson());
                        const messageId = messageRef.id;

                        // Update the new message with the generated ID
                        newMessage.messageId = messageId;

                        // Clear message input and selected file
                        this.textArea = '';
                        this.selectedFile = undefined;
                    } catch (error) {
                        console.error('Error uploading file:', error);
                    }
                };
                fileReader.readAsDataURL(this.selectedFile);
            } else {
                // If no file is selected, just add the message to Firestore
                const messageRef = await addDoc(collection(this.firestore, 'messages'), newMessage.toJson());
                const messageId = messageRef.id;
                newMessage.messageId= messageId;
                // Clear message input
                this.textArea = '';
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
}


  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }
}
