import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MainChatComponent } from '../main-chat.component';
import {
  Firestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { Message } from '../../classes/message.class';
import { CommonModule } from '@angular/common';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { user } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { DrawerService } from '../../firebase-services/drawer.service';

@Component({
  selector: 'app-message-layout-thread',
  standalone: true,
  imports: [
    MatDividerModule,
    MainChatComponent,
    CommonModule,
    PickerModule,
    FormsModule,
    MessageLayoutThreadComponent,
    MatDividerModule
  ],
  templateUrl: './message-layout-thread.component.html',
  styleUrl: './message-layout-thread.component.scss',
})
export class MessageLayoutThreadComponent implements OnInit {
  @Input() userId?: string;
  constructor(private threadService: DrawerService, private firestore: Firestore) {}
  selectedMessage: Message | null = null;
  threadMessages: Message[] = [];

  ngOnInit() {
    this.threadService.selectedMessageChanged.subscribe((selectedMessage: Message | null) => {
      if (selectedMessage) {
        this.selectedMessage = selectedMessage;
        console.log(selectedMessage);
        this.fetchThreadMessages(selectedMessage.messageId);
      }
    });
  }

  fetchThreadMessages(messageId: string): void {
    const threadsRef = collection(this.firestore, `messages/${messageId}/threads`);
    const q = query(threadsRef, orderBy('time')); // Assuming you have a 'time' field for ordering

    onSnapshot(q, (querySnapshot) => {
      this.threadMessages = [];
      querySnapshot.forEach((doc) => {
        const message = { messageId: doc.id, ...doc.data() } as Message; // Add the doc.id as messageId if needed
        this.threadMessages.push(message);
      });
      console.log(this.threadMessages); // For debugging
    }, error => {
      console.error("Error fetching thread messages:", error);
    });
  }
}
