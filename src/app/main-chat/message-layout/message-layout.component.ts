import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
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
import { GetIdService } from '../../firebase-services/get-id.service';
import { MatDrawer } from '@angular/material/sidenav';
import { DrawerService } from '../../firebase-services/drawer.service';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { MatDialog } from '@angular/material/dialog';
import { ViewSpecificProfileComponent } from '../../popup/view-specific-profile/view-specific-profile.component';
@Component({
  selector: 'app-message-layout',
  standalone: true,
  imports: [
    MatDividerModule,
    CommonModule,
    PickerModule,
    FormsModule,
    MatDrawer,
  ],
  templateUrl: './message-layout.component.html',
  styleUrls: ['./message-layout.component.scss'],
})
export class MessageLayoutComponent implements OnInit {
  @Input() userId?: string;
  @Input() userName!: string;
  @Input() userImage!: string;
  @ViewChild('drawer') drawer!: MatDrawer;

  isHovered: { [key: string]: boolean } = {};
  public textArea: string = '';
  public isEmojiPickerVisible: { [key: string]: boolean } = {};
  public isEditingEnabled: { [key: string]: boolean } = {};
  public isEditEnabled: { [key: string]: boolean } = {};
  public editedMessage: { [key: string]: string } = {};
  public selectedMessage: Message | null = null;
  public channelDoc: any;

  channelIds: string[] = [];
  selectedChannelId?: string;
  private messagesSubject: BehaviorSubject<Message[]> = new BehaviorSubject<
    Message[]
  >([]);
  messages$: Observable<Message[]> = this.messagesSubject.asObservable();
  @ViewChild('emojiPicker') emojiPicker: ElementRef | undefined;
  constructor(
    private firestore: Firestore,
    private drawerService: DrawerService,
    private id: GetIdService,
    private firebase: FirebaseService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.firebase.selectedChannelId$.subscribe((channelId) => {
      if (channelId !== null) {
        this.selectedChannelId = channelId; // This will now only assign non-null values

        if (channelId) {
          this.loadMessages(channelId);
        }
      } else {
        // Handle the null case explicitly, e.g., reset selectedChannelId or take other appropriate action
        this.selectedChannelId = undefined; // or set to a default/fallback value if suitable
      }
    });
  }

  openThread(message: Message): void {
    this.drawerService.openDrawer(message);
    this.drawerService.setSelectedMessage(message);
  }

  loadMessages(channelId: string): void {
    const messagesCollection = collection(
      this.firestore,
      `channels/${channelId}/channelMessages`
    );
    const q = query(messagesCollection, orderBy('time', 'desc'));

    this.messages$ = new Observable<Message[]>((observer) => {
      onSnapshot(
        q,
        (querySnapshot) => {
          const messages: Message[] = [];
          querySnapshot.forEach((doc) => {
            const message = doc.data() as Message;
            message.messageId = doc.id;
            messages.push(message);
          });
          observer.next(messages.reverse());
        },
        (error) => observer.error(error)
      );
    });
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
    console.log('Selected emoji:', event.emoji.native);
    this.addReaction(message, event.emoji.native);
  }

  addReaction(message: Message, emoji: string) {
    if (!message.reactions) {
      message.reactions = {};
    }

    if (!emoji) {
      console.error('Selected emoji is undefined');
      return;
    }

    if (!message.reactions[emoji]) {
      message.reactions[emoji] = 1;
    } else {
      message.reactions[emoji]++;
    }

    this.updateMessageReactions(this.selectedChannelId!, message);

    this.closeEmojiPicker(message.messageId);
  }

  closeEmojiPicker(messageId: string) {
    this.isEmojiPickerVisible[messageId] = false;
  }

  toggleReaction(message: Message, emoji: string) {
    if (!this.userId) {
      console.error('UserID is not defined.');
      return;
    }

    const userId = this.userId;

    if (message.reactions && message.reactions[emoji]) {
      if (message.senderId === userId && message.reactions[emoji] > 0) {
        message.reactions[emoji]--; // Decrease count if same user reacts with the same emoji
      } else {
        message.reactions[emoji]++; // Increase count if different user reacts or same user reacts differently
      }
    } else {
      if (!message.reactions) {
        message.reactions = {};
      }
      message.reactions[emoji] = 1; // Initialize count if emoji is reacted for the first time
    }

    this.updateMessageReactions(this.selectedChannelId!, message);
  }

  updateMessageReactions(channelId: string, message: Message) {
    console.log(channelId);
    // Construct the correct path using the provided channelId
    const messageRef = doc(
      this.firestore,
      `channels/${channelId}/channelMessages`,
      message.messageId
    );
    const reactionsData = message.reactions || {};

    setDoc(messageRef, { reactions: reactionsData }, { merge: true })
      .then(() => {
        console.log('Reactions successfully updated.');
      })
      .catch((error) => {
        console.error('Error updating reactions:', error);
      });
  }

  toggleHoverOptions(messageId: string, value: boolean): void {
    this.isHovered[messageId] = value;

    if (!value && this.isEditingEnabled[messageId]) {
      this.isEditingEnabled[messageId] = false;
    }
  }

  toggleEditMessage(messageId: string): void {
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

  saveEditedMessage(channelId: string, message: Message): void {
    console.log(message.messageId);
    const editedText = this.editedMessage[message.messageId];

    // Update the message in the Firebase Firestore
    const messageRef = doc(
      this.firestore,
      `channels/${channelId}/channelMessages`,
      message.messageId
    );
    setDoc(messageRef, { message: editedText.split('\n') }, { merge: true })
      .then(() => {
        console.log('Message successfully updated.');
        // Disable edit mode after saving
        this.toggleEditMessage(message.messageId);
        this.isEditingEnabled[message.messageId] = false;
      })
      .catch((error) => {
        console.error('Error updating message:', error);
      });
    this.isEditEnabled[message.messageId] = false;
    this.isEditingEnabled[message.messageId] = false;
  }

  cancelEdit(messageId: string): void {
    this.isEditEnabled[messageId] = false;

    this.isHovered[messageId] = false;
    this.isEditingEnabled[messageId] = false;
  }

  getMessageText(messageId: string): Observable<string> {
    return this.messages$.pipe(
      map((messages) => {
        const message = messages.find((m) => m.messageId === messageId);
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
      panelClass: 'border',
    });
  }
}
