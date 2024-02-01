import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MainChatComponent } from '../main-chat.component';
import { Firestore, collection, query, orderBy, onSnapshot,doc } from '@angular/fire/firestore';
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
export class MessageLayoutComponent implements OnInit{
  @Input() userId?: string;
  @Input() userName!: string;
  @Input() userImage!: string;
  messages$: Observable<Message[]> | undefined;
  public textArea: string = "";
  public isEmojiPickerVisible: boolean = false;
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
          // Fetch download URL for message image
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

  toggleEmojiPicker() {
    this.isEmojiPickerVisible = !this.isEmojiPickerVisible;
    // this.selectedMessage = messageId;
  }


  // addReaction(messageId: string, emoji: string) {
  //   if (this.messages$) {
  //     this.messages$.subscribe(messages => {
  //       const message = messages.find(msg => msg.id === messageId);
  //       if (message) {
  //         message.addReaction(emoji);
  //         const updatedMessages = [...messages];
  //         this.firestore.doc(`messages/${messageId}`).update(message.toJson());
  //       }
  //     });
  //   }
  // }


}
