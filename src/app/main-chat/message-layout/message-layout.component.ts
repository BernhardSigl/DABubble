import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MainChatComponent } from '../main-chat.component';
import { Firestore, collection, query, orderBy, onSnapshot, doc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Message } from '../../classes/message.class';
import { CommonModule } from '@angular/common';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { PickerModule } from "@ctrl/ngx-emoji-mart";
import { user } from '@angular/fire/auth';

@Component({
  selector: 'app-message-layout',
  standalone: true,
  imports: [MatDividerModule, MainChatComponent, CommonModule, PickerModule],
  templateUrl: './message-layout.component.html',
  styleUrls: ['./message-layout.component.scss']
})
export class MessageLayoutComponent implements OnInit {
  @Input() userId?: string;
  @Input() userName!: string;
  @Input() userImage!: string;
  messages$: Observable<Message[]> | undefined;

  public textArea: string = "";
  public isEmojiPickerVisible: { [key: string]: boolean } = {};
  @ViewChild('emojiPicker') emojiPicker: ElementRef | undefined
  constructor(private firestore: Firestore) {}
  selectedMessage: Message | null = null;

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    const messagesCollection = collection(this.firestore, 'messages');
    const q = query(messagesCollection, orderBy('time', 'desc'));
    this.messages$ = new Observable<Message[]>(observer => {
      onSnapshot(q, (querySnapshot) => {
        const messages: Message[] = [];
        querySnapshot.forEach(async doc => {
          const messageData = doc.data() as Message;
          // Assign the document ID as the messageId
          messageData.messageId = doc.id; // Assuming doc.id is the ID of the document
          if (messageData.messageImage) {
            const storage = getStorage();
            const imageRef = ref(storage, messageData.messageImage as string);
            messageData.messageImage = await getDownloadURL(imageRef);
          }
          messages.push(messageData);
        });
        observer.next(messages);
      });
    });
  }

  toggleEmojiPicker(messageId: string) {
    if (!this.isEmojiPickerVisible[messageId]) {
      // If emoji picker is not visible, close all other emoji pickers
      Object.keys(this.isEmojiPickerVisible).forEach(key => {
        this.isEmojiPickerVisible[key] = false;
      });
    }
    this.isEmojiPickerVisible[messageId] = !this.isEmojiPickerVisible[messageId];
  }

  onEmojiClick(event: any, message: Message) {
    console.log("Selected emoji:", event.emoji.native);
    this.addReaction(message, event.emoji.native);
  }

  addReaction(message: Message, emoji: string) {
    console.log("Adding reaction to message:", message);
    console.log("Selected emoji:", emoji);

    if (!message.reactions) {
      message.reactions = {}; // Ensure reactions object is initialized
    }

    if (!emoji) {
      console.error("Selected emoji is undefined");
      return;
    }

    if (!message.reactions[emoji]) {
      message.reactions[emoji] = 1;
    } else {
      message.reactions[emoji]++;
    }

    this.updateMessageReactions(message);
  }

  // toggleReaction(message: Message, emoji: string) {
  //   if (!this.userId) {
  //     console.error("UserID is not defined.");
  //     return;
  //   }

  //   const userId = this.userId;

  //   // Check if the user has already reacted to the emoji
  //   if (message.reactions && message.reactions[emoji]) {
  //     if (message.reactions[emoji] === 1 && message.senderId === userId) {
  //       // If the count is 1 and the current user reacted, delete the reaction
  //       delete message.reactions[emoji];
  //     } else {
  //       // Decrement the count if the current user reacted, or do nothing if another user reacted
  //       message.reactions[emoji]--;
  //     }
  //   } else {
  //     // If the emoji reaction doesn't exist, increment the count
  //     if (!message.reactions) {
  //       message.reactions = {}; // Ensure reactions object is initialized
  //     }
  //     message.reactions[emoji] = 1;
  //   }

  //   // Update reactions in Firestore
  //   this.updateMessageReactions(message);
  // }

  toggleReaction(message: Message, emoji: string) {
    if (!this.userId) {
      console.error("UserID is not defined.");
      return;
    }

    const userId = this.userId;

    // Check if the user has already reacted to the emoji
    if (message.reactions && message.reactions[emoji]) {
      if (message.senderId === userId) {
        // If the current user is the sender, decrement the count or delete the reaction
        if (message.reactions[emoji] === 1) {
          delete message.reactions[emoji]; // Delete the reaction if count is 1
        } else {
          message.reactions[emoji]--; // Decrement the count
        }
      } else {
        // If the current user is not the sender, increment the count
        message.reactions[emoji]++;
      }
    } else {
      // If the emoji reaction doesn't exist, initialize it
      if (!message.reactions) {
        message.reactions = {}; // Ensure reactions object is initialized
      }
      // If the current user is not the sender, set the count to 1
      message.reactions[emoji] = (message.senderId === userId) ? 1 : 1;
    }

    // Update reactions in Firestore
    this.updateMessageReactions(message);
  }


  updateMessageReactions(message: Message) {
    // Update reactions in Firestore
    const messageRef = doc(this.firestore, 'messages', message.messageId);
    const reactionsData = message.reactions || {}; // Make sure the reaction object exists

    setDoc(messageRef, { reactions: reactionsData }, { merge: true })
    .then(() => {
      console.log("Reactions successfully updated in Firestore.");
    })
    .catch(error => {
      console.error("Error updating reactions in Firestore:", error);
    });
  }
}
