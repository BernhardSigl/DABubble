import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PickerModule } from "@ctrl/ngx-emoji-mart";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, addDoc, collection, getDocs, query } from '@angular/fire/firestore';
import { timestamp } from 'rxjs';
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

  constructor(private elementRef: ElementRef, private firestore: Firestore,private firebaseService: FirebaseService) { }

  toggleEmojiPicker() {
    this.isEmojiPickerVisible = !this.isEmojiPickerVisible;
  }

  addEmoji(event: { emoji: { native: any } }) {
    this.textArea += event.emoji.native;
    this.isEmojiPickerVisible = false;
  }

  // async sendMessage(): Promise<void> {
  //   // debugger;
  //   if (this.textArea.trim() !== '') {
  //     try {
  //       // Ensure sender information is available
  //       await this.firebaseService.getLoggedInUserInfos();
  //       const senderName = this.firebaseService.name;
  //       const senderProfileImg = this.firebaseService.profileImg;
  //       console.log(senderName,senderProfileImg)
  //       // Check if sender information is available
  //       if (!senderName || !senderProfileImg) {
  //         console.error('Sender information not available');
  //         return;
  //       }

  //       await addDoc(collection(this.firestore, 'messages'), {
  //         content: this.textArea,
  //         timestamp: new Date(),
  //         sender: senderName,
  //         profileImg: senderProfileImg,
  //         // Add more fields as needed
  //       });

  //       this.textArea = '';
  //     } catch (error) {
  //       console.error('Error sending message:', error);
  //     }
  //   }
  // }

}
