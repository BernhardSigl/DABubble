import { Component, Input, OnInit } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MainChatComponent } from '../main-chat.component';
import { Firestore, collection, query, orderBy, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Message } from '../../classes/message.class';
import { CommonModule } from '@angular/common';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';

@Component({
  selector: 'app-message-layout',
  standalone: true,
  imports: [MatDividerModule, MainChatComponent, CommonModule],
  templateUrl: './message-layout.component.html',
  styleUrls: ['./message-layout.component.scss']
})
export class MessageLayoutComponent implements OnInit{
  @Input() userId?: string;
  @Input() userName!: string;
  @Input() userImage!: string;
  messages$: Observable<Message[]> | undefined;

  constructor(private firestore: Firestore) {}

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
          console.log('Document:', doc.data());
          const messageData = doc.data() as Message;
          // Fetch download URL for message image
          if (messageData.messageImage) {
            const storage = getStorage();
            const imageRef = ref(storage, messageData.messageImage as string);
            messageData.messageImage = await getDownloadURL(imageRef);
          }
          messages.push(messageData);
          console.log('Sender ID:', messageData.senderId);
          console.log('Current User ID:', this.userId);
        });
        observer.next(messages);
      });
    });
  }
}
