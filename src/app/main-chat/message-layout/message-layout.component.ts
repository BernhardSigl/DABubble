import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  AfterViewChecked,
  AfterViewInit,
  EventEmitter,
  Output,
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
export class MessageLayoutComponent implements OnInit, AfterViewInit  {
  @Input() userId?: string = '';
  @Input() userName!: string;
  @Input() userImage!: string;
  @ViewChild('drawer') drawer!: MatDrawer;
  // @ViewChild('scrollContainer') private scrollContainer: ElementRef | undefined;
  @ViewChild('emojiPicker') emojiPicker: ElementRef | undefined;

  private messagesSubject: BehaviorSubject<Message[]> = new BehaviorSubject<
    Message[]
  >([]);
  public textArea: string = '';
  public isEmojiPickerVisible: { [key: string]: boolean } = {};
  public isEditingEnabled: { [key: string]: boolean } = {};
  public isEditEnabled: { [key: string]: boolean } = {};
  public editedMessage: { [key: string]: string } = {};
  public selectedMessage: Message | null = null;
  public channelDoc: any;

  messages: Message[] = [];
  isHovered: { [key: string]: boolean } = {};
  channelIds: string[] = [];
  groupedMessages: { date: Date; messages: Message[] }[] = [];
  selectedChannelId?: string;
  messages$: Observable<Message[]> = this.messagesSubject.asObservable();

  constructor(
    private firestore: Firestore,
    private drawerService: DrawerService,
    private firebase: FirebaseService,
    public dialog: MatDialog,
    private changeDetector: ChangeDetectorRef,
    private el: ElementRef
  ) {}

  getNativeElement(): HTMLElement {
    return this.el.nativeElement;
  }

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

  ngAfterViewInit(): void {
    // console.log('ngAfterViewInit in MessageLayoutComponent');
  }


  // scrollToBottom(): void {
  //   try {
  //     if (this.scrollContainer) {
  //       this.scrollContainer.nativeElement.scrollTop =
  //         this.scrollContainer.nativeElement.scrollHeight;
  //     }
  //   } catch (err) {
  //     console.error('Error scrolling to bottom:', err);
  //   }
  // }

  // ngAfterViewChecked() {
    // this.scrollToBottom()
  // }

  // scrollToBottom(): void {  
  //   try {
  //     if (this.scrollContainer) {
  //       console.log(this.scrollContainer);
        
  //       // console.log(this.scrollContainer,this.scrollContainer.nativeElement.scrollHeight)
  //       this.scrollContainer.nativeElement.scrollTop =
  //         this.scrollContainer.nativeElement.scrollHeight;
  //     }
  //   } catch (err) {
  //     console.error('Error scrolling to bottom:', err);
  //   }
  // }


  openThread(message: Message): void {
    this.drawerService.openDrawer(message);
    this.drawerService.setSelectedMessage(message);
    this.drawerService.openThread();
  }

  loadMessages(channelId: string): void {
    const messagesCollection = collection(
      this.firestore,
      `channels/${channelId}/channelMessages`
    );
    const q = query(messagesCollection, orderBy('time', 'desc'));

    onSnapshot(
      q,
      (querySnapshot) => {
        const messages: Message[] = [];
        querySnapshot.forEach((doc) => {
          const message = doc.data() as Message;
          message.messageId = doc.id;
          if (message.senderId === this.userId) {
            // Check if the user has updated their name
            if (this.firebase.updatedName) {
              message.name = this.firebase.updatedName;
            } else {
              // Use the default user name
              message.name = this.userName;
            }
          } else {
            // For messages from other users, use their default name
            message.name = message.name;
          }
          messages.push(message);
        });
        this.messages = messages.reverse(); // Set messages directly
        this.messagesSubject.next(this.messages); // Update the messages
        this.groupMessagesByDate(); // Group messages after setting
        // this.scrollToBottom()
      },
      (error) => console.error('Error fetching messages:', error)
    );
  }

  clearMessages(): void {
    this.messages = [];
    this.messagesSubject.next([]);
  }

  groupMessagesByDate() {
    const groups = new Map<string, Message[]>();

    this.messages.forEach((message) => {
      const messageDate = new Date(message.time);
      const formattedDate = messageDate.toISOString().split('T')[0];

      if (!groups.has(formattedDate)) {
        groups.set(formattedDate, []);
      }

      groups.get(formattedDate)?.push(message);
    });

    this.groupedMessages = Array.from(groups.entries()).map(
      ([date, messages]) => ({
        date: new Date(date),
        messages: messages,
      })
    );
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
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
    if (this.userId) {
      this.addReaction(message, event.emoji.native, this.userId);
    } else {
      console.error('UserID is not defined.');
    }
  }

  addReaction(message: Message, emoji: string, userId: string) {
    // Initialize the reaction object for the emoji if it does not exist
    if (!message.reactions[emoji]) {
      message.reactions[emoji] = { count: 0, users: {} };
    }

    let emojiReaction = message.reactions[emoji];

    // If the user has not already reacted with this emoji, add their reaction
    if (!emojiReaction.users[userId]) {
      emojiReaction.count += 1;
      emojiReaction.users[userId] = true; // Mark this user as having reacted with this emoji
    }

    // Update the message reactions in Firebase
    this.updateMessageReactions(this.selectedChannelId!, message);

    // Close the emoji picker UI
    this.closeEmojiPicker(message.messageId);
  }

  closeEmojiPicker(messageId: string) {
    this.isEmojiPickerVisible[messageId] = false;
  }

  toggleReaction(message: Message, emoji: string, userId: string) {
    if (!message.reactions[emoji]) {
      message.reactions[emoji] = { count: 0, users: {} };
    }

    let emojiReaction = message.reactions[emoji];

    if (emojiReaction.users[userId]) {
      // If the user has already reacted with this emoji, remove their reaction
      emojiReaction.count = Math.max(0, emojiReaction.count - 1);
      delete emojiReaction.users[userId];
    } else {
      // If the user hasn't reacted with this emoji, add their reaction
      emojiReaction.count += 1;
      emojiReaction.users[userId] = true;
    }

    // If no one has reacted with this emoji after toggling, remove the emoji from reactions
    if (emojiReaction.count === 0) {
      delete message.reactions[emoji];
    }

    // Proceed to update the message reactions in Firebase
    this.updateMessageReactions(this.selectedChannelId!, message);
  }

  updateMessageReactions(channelId: string, message: Message) {
    // Construct the correct path using the provided channelId
    const messageRef = doc(
      this.firestore,
      `channels/${channelId}/channelMessages`,
      message.messageId
    );
    const reactionsData = message.reactions || {};

    setDoc(messageRef, { reactions: message.reactions }, { merge: true })
      .then(() => console.log('Reactions successfully updated.'))
      .catch((error) => console.error('Error updating reactions:', error));
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
    const editedText = this.editedMessage[message.messageId];

    // Update the message in the Firebase Firestore
    const messageRef = doc(
      this.firestore,
      `channels/${channelId}/channelMessages`,
      message.messageId
    );
    setDoc(messageRef, { message: editedText.split('\n') }, { merge: true })
      .then(() => {
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
