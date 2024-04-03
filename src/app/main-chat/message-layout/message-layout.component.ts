import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
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
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { MatDrawer } from '@angular/material/sidenav';
import { DrawerService } from '../../firebase-services/drawer.service';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { MatDialog } from '@angular/material/dialog';
import { ViewSpecificProfileComponent } from '../../popup/view-specific-profile/view-specific-profile.component';
import { MessageServiceService } from '../../firebase-services/message-service.service';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { LOCALE_ID } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-message-layout',
  standalone: true,
  imports: [
    MatDividerModule,
    CommonModule,
    PickerModule,
    FormsModule,
    MatDrawer,
    MatProgressSpinnerModule
  ],
  templateUrl: './message-layout.component.html',
  styleUrls: ['./message-layout.component.scss'],
  providers: [
    DatePipe,
    { provide: LOCALE_ID, useValue: 'de' }, // Setzen Sie die Locale auf Deutsch
  ],
})
export class MessageLayoutComponent implements OnInit {
  @Input() userId?: string = '';
  @Input() userName!: string;
  @Input() userImage!: string;
  @ViewChild('drawer') drawer!: MatDrawer;
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
  public openedThreadId: string | null = null;
  messages: Message[] = [];
  isHovered: { [key: string]: boolean } = {};
  channelIds: string[] = [];
  groupedMessages: { date: Date; messages: Message[] }[] = [];
  selectedChannelId?: string;
  messages$: Observable<Message[]> = this.messagesSubject.asObservable();
  threadLength: number = 0;
  isLoading: boolean = true;
  currentThreadId!: string;

  constructor(
    private firestore: Firestore,
    private drawerService: DrawerService,
    public firebase: FirebaseService,
    public dialog: MatDialog,
    private changeDetector: ChangeDetectorRef,
    private el: ElementRef,
    private scrollHelper: MessageServiceService,
    private datePipe: DatePipe
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
    registerLocaleData(localeDe);
    this.changeDetector.detectChanges();
    this.isLoading = false;
  }

  navBehaviour() {
    if (
      window.innerWidth < 1400 &&
      this.drawerService.threadIsOpen
    ) {
      this.drawerService.closeSideNav();
    }
  }

  formatMessageDate(date: Date | null): string {
    if (!date) {
      return '';
    }

    const today = new Date();
    if (this.isSameDay(date, today)) {
      return 'Heute';
    }

    return this.datePipe.transform(date, 'EEEE, dd MMMM', 'de') || '';
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  openThread(message: Message, messageId: string): void {
    if (this.drawerService.threadIsOpen === false) {
      this.currentThreadId = messageId;
      this.drawerService.threadIsOpen = true;
      this.drawerService.openDrawer(message);
      this.drawerService.openThread();
    } else {
      this.drawerService.closeDrawer();
      if (this.currentThreadId && this.currentThreadId !== messageId) {
        setTimeout(() => {
          this.drawerService.openDrawer(message);
          this.drawerService.openThread();
          this.currentThreadId = messageId;
        }, 0);
      }
    }
    this.navBehaviour();
  }

  // Call getThreadMessagesCount when loading messages
  async loadMessages(channelId: string): Promise<void> {
    const messagesCollection = collection(
      this.firestore,
      `channels/${channelId}/channelMessages`
    );
    const q = query(messagesCollection, orderBy('time', 'desc'));

    onSnapshot(
      q,
      async (querySnapshot) => {
        const messages: Message[] = [];
        querySnapshot.forEach(async (doc) => {
          const message = doc.data() as Message;
          message.messageId = doc.id;

          // Load thread messages count and update message.threadLength
          this.getThreadMessagesCount(message.messageId, message);

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
        await this.scrollHelper.scrollDown('channel');
      },
      (error) => console.error('Error fetching messages:', error)
    );
  }

  async getThreadMessagesCount(
    mainMessageId: string,
    message: Message
  ): Promise<void> {
    const threadsRef = collection(
      this.firestore,
      `channels/${this.selectedChannelId}/channelMessages/${mainMessageId}/Thread`
    );

    // Listen to changes in the thread collection
    onSnapshot(threadsRef, (querySnapshot) => {
      const threadMessagesCount = querySnapshot.size;

      // Update message.threadLength
      message.threadLength = threadMessagesCount;

      // Update Firestore document with the new thread length
      setDoc(
        doc(
          this.firestore,
          `channels/${this.selectedChannelId}/channelMessages/${mainMessageId}`
        ),
        { threadLength: threadMessagesCount },
        { merge: true }
      );
    });
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
      panelClass: ['border', 'view-profile-popup'],
    });
  }
}
