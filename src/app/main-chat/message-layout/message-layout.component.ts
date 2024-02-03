import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MainChatComponent } from '../main-chat.component';
import { Firestore, collection, query, orderBy, onSnapshot,doc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Message } from '../../classes/message.class';
import { CommonModule } from '@angular/common';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { PickerModule } from "@ctrl/ngx-emoji-mart";
@Component({
  selector: 'app-message-layout',
  standalone: true,
  imports: [MatDividerModule, MainChatComponent, CommonModule,PickerModule],
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


updateMessageReactions(message: Message) {
  console.log("Updating reactions in Firestore for message:", message);

  const messageRef = doc(this.firestore, 'messages', message.messageId);
  const reactionsData = message.reactions;

  console.log("Reactions data:", reactionsData);

  setDoc(messageRef, { reactions: reactionsData }, { merge: true })
  // .then(() => {
  //   console.log("Reactions updated successfully in Firestore.");
  // })
  // .catch(error => {
  //   console.error("Error updating reactions in Firestore:", error);
  // });
}



}
