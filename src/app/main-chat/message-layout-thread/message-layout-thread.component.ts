import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
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
  getDoc,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { Message } from '../../classes/message.class';
import { CommonModule } from '@angular/common';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { DrawerService } from '../../firebase-services/drawer.service';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { MessageServiceService } from '../../firebase-services/message-service.service';
import { ThreadComponent } from '../thread/thread.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ViewSpecificProfileComponent } from '../../popup/view-specific-profile/view-specific-profile.component';
import { MatDialog } from '@angular/material/dialog';

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
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './message-layout-thread.component.html',
  styleUrl: './message-layout-thread.component.scss',
})
export class MessageLayoutThreadComponent implements OnInit {
  @Input() userId?: string;
  constructor(
    private threadService: DrawerService,
    private firestore: Firestore,
    public firebase: FirebaseService,
    private el: ElementRef,
    private scrollHelper: MessageServiceService,
    public dialog: MatDialog
    
  ) {}
  selectedMessage: Message | null = null;
  threadMessages: Message[] = [];
  public isEditEnabled: { [key: string]: boolean } = {};
  public editedMessage: { [key: string]: string } = {};
  public isEditingEnabled: { [key: string]: boolean } = {};
  public isEmojiPickerVisible: { [key: string]: boolean } = {};
  public isHovered: { [key: string]: boolean } = {};
  public textArea: string = '';
  @ViewChild('emojiPicker') emojiPicker: ElementRef | undefined;
  private messagesSubject: BehaviorSubject<Message[]> = new BehaviorSubject<
    Message[]
  >([]);
  messages$: Observable<Message[]> = this.messagesSubject.asObservable();
  @Input() threadId: string = '';
  messageId: string = '';
  selectedChannelId?: string;
  isLoading: boolean = true;
  @ViewChild(ThreadComponent)
  threadLayout!: ThreadComponent;

  async ngOnInit(): Promise<void> {
    this.scrollHelper.registerThreadComponent(this);
    await this.subThreadService();
    await this.subSelectedChannel();
    await this.firebase.ngOnInit();
    this.isLoading = false;
  }

  async subThreadService() {
    this.threadService.selectedMessageChanged.subscribe(
      (selectedMessage: Message | null) => {
        if (selectedMessage) {
          this.selectedMessage = selectedMessage;
          this.fetchThreadMessages(selectedMessage.messageId);
          this.messageId = selectedMessage.messageId;
        }
      }
    );
  }

  async subSelectedChannel() {
    this.firebase.selectedChannelId$.subscribe((channelId) => {
      if (channelId !== null) {
        this.selectedChannelId = channelId; // This will now only assign non-null values
      } else {
        // Handle the null case explicitly, e.g., reset selectedChannelId or take other appropriate action
        this.selectedChannelId = undefined; // or set to a default/fallback value if suitable
      }
    });
  }

  getNativeThreadElement(): HTMLElement {
    return this.el.nativeElement;
  }

  async fetchThreadMessages(messageId: string): Promise<void> {
    const threadsRef = collection(
      this.firestore,
      `channels/${this.selectedChannelId}/channelMessages/${messageId}/Thread`
    );
    const q = query(threadsRef, orderBy('time'));
  
    onSnapshot(
      q,
      async (querySnapshot) => {
        this.threadMessages = [];
        querySnapshot.forEach(async (doc) => {
          const message = { messageId: doc.id, ...doc.data() } as Message;
  
          // Fetch the user data for this message
          const userData = await this.getUserData(message.senderId);
  
          // Update message properties if user data exists
          if (userData) {
              message.name = userData.name;
              message.image = userData.profileImg;
          }
  
          this.threadMessages.push(message);
        });
      },
      (error) => {
        console.error('Error fetching thread messages:', error);
      }
    );
  }

  async getUserData(userId: string): Promise<any> {
    try {
      const userDoc = await getDoc(doc(this.firestore, `users/${userId}`));
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        console.error(`User with ID ${userId} does not exist.`);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }
  

  toggleEmojiPicker(messageId: string) {
    if (!this.isEmojiPickerVisible[messageId]) {
      Object.keys(this.isEmojiPickerVisible).forEach((key) => {
        this.isEmojiPickerVisible[key] = false;
      });
    }
    this.isEmojiPickerVisible[messageId] =
      !this.isEmojiPickerVisible[messageId];
  }

  onEmojiClick(event: any, message: Message) {
    this.addReactionThread(message, event.emoji.native);
  }

  async toggleReactionThread(message: Message, emoji: string) {
    if (!this.userId) {
      console.error('UserID is not defined.');
      return;
    }

    if (!message.reactions[emoji]) {
      message.reactions[emoji] = { count: 0, users: {} };
    }

    if (message.reactions[emoji].users[this.userId]) {
      // If the user has reacted with this emoji, remove their reaction
      message.reactions[emoji].count = Math.max(
        0,
        message.reactions[emoji].count - 1
      );
      delete message.reactions[emoji].users[this.userId];
    } else {
      // If the user hasn't reacted with this emoji, add their reaction
      message.reactions[emoji].count++;
      message.reactions[emoji].users[this.userId] = true;
    }

    // If no one has reacted with this emoji after toggling, consider removing the emoji from reactions
    if (message.reactions[emoji].count === 0) {
      delete message.reactions[emoji];
    }

    await this.updateReactionsInFirestore(message);
  }

  async addReactionThread(message: Message, emoji: string) {
    if (!this.userId) {
      console.error('UserID is not defined.');
      return;
    }

    if (!message.reactions[emoji]) {
      message.reactions[emoji] = { count: 1, users: { [this.userId]: true } };
    } else {
      if (!message.reactions[emoji].users[this.userId]) {
        message.reactions[emoji].count++;
        message.reactions[emoji].users[this.userId] = true;
      } else {
        // If the user has already reacted with this emoji, consider if you want to toggle the reaction off instead
        console.warn('User has already reacted with this emoji.');
        return;
      }
    }

    await this.updateReactionsInFirestore(message);
    this.closeEmojiPicker(message.messageId);
  }

  async updateReactionsInFirestore(message: Message) {
    try {
      const threadDocRef = doc(
        this.firestore,
        `channels/${this.selectedChannelId}/channelMessages/${this.messageId}/Thread/${message.messageId}`
      );
      await setDoc(
        threadDocRef,
        { reactions: message.reactions },
        { merge: true }
      );
    } catch (error) {
      console.error('Error updating reactions in Firestore:', error);
    }
  }

  closeEmojiPicker(messageId: string) {
    this.isEmojiPickerVisible[messageId] = false;
  }

  toggleEditMessageThread(messageId: string): void {
    // Set editing enabled state to true for "Nachricht Bearbeiten"
    this.isEditingEnabled[messageId] = true;

    // Reset the edited message content when toggling edit mode
    this.editedMessage[messageId] = '';
  }

  toggleToTextArea(messageId: string): void {
    // Set edit enabled state to true
    this.isEditEnabled[messageId] = true;
    // Subscribe to the Observable returned by getMessageText
    this.getMessageText(messageId).subscribe((messageText) => {
      // Assign the message text to editedMessage[messageId]
      this.editedMessage[messageId] = messageText;
    });
    this.isEditingEnabled[messageId] = false;
  }

  saveEditedMessageThread(messageId: string, editedText: string): void {
    // Update the message in the Firebase Firestore
    // Assuming you have a way to identify the thread message document
    const messageRef = doc(
      this.firestore,
      `channels/${this.selectedChannelId}/channelMessages/${this.messageId}/Thread/${messageId}`
    );
    setDoc(messageRef, { message: editedText.split('\n') }, { merge: true })
      .then(() => {
        this.toggleEditMessageThread(messageId);
        this.isEditEnabled[messageId] = false;
        this.isEditingEnabled[messageId] = false;
      })
      .catch((error) => {
        console.error('Error updating message:', error);
      });
  }

  cancelEditThread(messageId: string): void {
    // Disable edit mode and reset the edited message content
    this.isEditEnabled[messageId] = false;
    this.editedMessage[messageId] = '';
    this.isEditingEnabled[messageId] = false;
  }

  getMessageText(messageId: string): Observable<string> {
    return this.messages$.pipe(
      map((messages) => {
        const message = this.threadMessages.find(
          (m) => m.messageId === messageId
        );
        return message ? message.message.join('\n') : '';
      })
    );
  }

  showProfile(name: string) {
    const filteredUsers = this.firebase.usersArray.filter(
      (user) => user.name === name
    );

    this.dialog.open(ViewSpecificProfileComponent, {
      data: {
        user: filteredUsers[0],
      },
      panelClass: ['border', 'view-profile-popup']
    });
  }
}

