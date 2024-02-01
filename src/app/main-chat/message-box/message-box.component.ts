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
            console.log(this.userName, this.userImage);
            const newMessage = new Message();
            newMessage.name = this.userName;
            newMessage.time = Date.now();
            newMessage.message.push(this.textArea);
            newMessage.image = this.userImage;
            if (this.userId) {
              console.log(this.userId)
              newMessage.senderId = this.userId;
          } else {
              console.log('not found')
          }

            if (this.selectedFile) {
                const storage = getStorage();
                const storageRef = ref(storage, `files/${this.selectedFile.name}`);

                // Read file contents as a data URL
                const fileReader = new FileReader();
                fileReader.onload = async (event) => {
                    try {
                        const fileDataUrl = event.target?.result as string;

                        // Upload the file data URL to Firebase Storage
                        await uploadString(storageRef, fileDataUrl, 'data_url');

                        // Update the message with the path of the uploaded file
                        newMessage.messageImage = `files/${this.selectedFile?.name}`;
                        console.log(newMessage.messageImage)
                        // Add the message to Firestore
                        await addDoc(collection(this.firestore, 'messages'), newMessage.toJson());

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
                await addDoc(collection(this.firestore, 'messages'), newMessage.toJson());

                // Clear message input
                this.textArea = '';

                // Append the message to the local array for immediate display
                // this.messages$.push(newMessage);
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
