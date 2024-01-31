import { Component, Input, OnInit } from '@angular/core';
import {MatDividerModule} from '@angular/material/divider';
import { MainChatComponent } from '../main-chat.component';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Message } from '../../classes/message.class';
import { CommonModule } from '@angular/common';
import { getDownloadURL, getStorage, ref, uploadString } from 'firebase/storage';

@Component({
  selector: 'app-message-layout',
  standalone: true,
  imports: [MatDividerModule,
  MainChatComponent,
CommonModule],
  templateUrl: './message-layout.component.html',
  styleUrl: './message-layout.component.scss'
})
export class MessageLayoutComponent implements OnInit{

  @Input() userName!: string;
  @Input() userImage!: string;
  messages$: Observable<Message[]> | undefined;

  constructor(private firestore: Firestore) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  async loadMessages(): Promise<void> {
    try {
      const messagesCollection = collection(this.firestore, 'messages');
      const q = query(messagesCollection);
      const querySnapshot = await getDocs(q);
      this.messages$ = new Observable<Message[]>(observer => {
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
        observer.complete();
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }
}
