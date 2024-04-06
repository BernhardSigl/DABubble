import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
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
import { FirebaseService } from '../../firebase-services/firebase.service';
import { PrivateMessageService } from '../../firebase-services/private-message.service';
import { MatDialog } from '@angular/material/dialog';
import { ViewSpecificProfileComponent } from '../../popup/view-specific-profile/view-specific-profile.component';
import { MessageServiceService } from '../../firebase-services/message-service.service';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { LOCALE_ID } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-message-layout-pc',
  standalone: true,
  imports: [
    MatDividerModule,
    CommonModule,
    PickerModule,
    FormsModule,
    MatDrawer,
    MatProgressSpinnerModule
  ],
  templateUrl: './message-layout-pc.component.html',
  styleUrl: './message-layout-pc.component.scss',
  providers: [
    DatePipe,
    { provide: LOCALE_ID, useValue: 'de' } // Setzen Sie die Locale auf Deutsch
  ]
})
export class MessageLayoutPcComponent {
  @Input() userId: string | null = null;
  @Input() userName!: string;
  @Input() userImage!: string;
  @Input() privateMessageId!: string;
  @ViewChild('drawer') drawer!: MatDrawer;
  isLoading: boolean = true;

  isHovered: { [key: string]: boolean } = {};
  public textArea: string = '';
  public isEmojiPickerVisible: { [key: string]: boolean } = {};
  public isEditingEnabled: { [key: string]: boolean } = {};
  public isEditEnabled: { [key: string]: boolean } = {};
  public editedMessage: { [key: string]: string } = {};
  public selectedMessage: Message | null = null;
  public channelDoc: any;
  public messageId: string = '';
  private messagesSubject: BehaviorSubject<Message[]> = new BehaviorSubject<
    Message[]
  >([]);
  groupedMessages: { date: Date; messages: Message[] }[] = [];
  messages$: Observable<Message[]> = this.messagesSubject.asObservable();
  @ViewChild('emojiPicker') emojiPicker: ElementRef | undefined;

  constructor(
    private firestore: Firestore,
    public firebase: FirebaseService,
    private privateMessage: PrivateMessageService,
    public dialog: MatDialog,
    private el: ElementRef,
    private scrollHelper: MessageServiceService,
    private datePipe: DatePipe,
    private changeDetector: ChangeDetectorRef,
  ) {}

  getNativeElement(): HTMLElement {
    return this.el.nativeElement;
  }

  ngOnInit() {
    this.privateMessage.selectedUser$.subscribe(data => {
      if (data) {
        this.userId = localStorage.getItem('userId');
        this.privateMessageId = data.privateMessageId;
        this.userName = data.user.name;
        this.userImage = data.user.profileImg;
        if ( this.privateMessageId) {
          this.loadMessages();
        }
      }
    });
    registerLocaleData(localeDe);
    this.changeDetector.detectChanges();
    this.isLoading = false;
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

  async loadMessages(): Promise<void> {
    if (!this.userId || !this.privateMessageId) {
      console.error('User ID or Private Message ID is missing.');
      return;
    }

    const messagesCollectionPath = `privateMessages/${this.privateMessageId}/messages`;

    const q = query(
      collection(this.firestore, messagesCollectionPath),
      orderBy('time', 'asc') // Order messages by time
    );

    onSnapshot(q, async (querySnapshot) => {
      const messages: Message[] = [];
      querySnapshot.forEach((doc)=>{
        const message = doc.data() as Message;
        message.messageId = doc.id;
        if(this.firebase.updatedName){
          message.name = this.firebase.updatedName;
        }else{
          message.name = message.name
        }

        messages.push(message)
      })
      this.messagesSubject.next(messages);
      this.groupMessagesByDate();
      await this.scrollHelper.scrollDown('privateChat');
    });
  }

  groupMessagesByDate() {
    this.messages$.subscribe(messages => {
      const groups = new Map<string, Message[]>();
    
      messages.forEach((message) => {
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
    this.addReaction(message, event.emoji.native);
  }

  addReaction(message: Message, emoji: string) {
    if (!this.userId) {
      console.error('UserID is not defined.');
      return;
    }
  
    if (!message.reactions[emoji]) {
      message.reactions[emoji] = { count: 1, users: { [this.userId]: true } };
    } else {
      message.reactions[emoji].count++;
      message.reactions[emoji].users[this.userId] = true;
    }
  
    this.updateMessageReactions(message);
  
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
  
    // Ensure the reactions object and the specific emoji reaction are initialized
    if (!message.reactions[emoji]) {
      message.reactions[emoji] = { count: 0, users: {} };
    }
  
    const hasReacted = message.reactions[emoji].users[this.userId];
  
    if (hasReacted) {
      // If the user has reacted with this emoji, remove their reaction
      message.reactions[emoji].count = Math.max(0, message.reactions[emoji].count - 1);
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
  
    this.updateMessageReactions(message);
  }
  
  updateMessageReactions(message: Message) {
    if (!this.privateMessageId || !message.messageId) {
      console.error('Missing PrivateMessageId or MessageId.');
      return;
    }
  
    const messageRef = doc(this.firestore, `privateMessages/${this.privateMessageId}/messages/${message.messageId}`);
  
    // Ensure we only update the reactions field to minimize overwriting other data
    setDoc(messageRef, { reactions: message.reactions }, { merge: true })
      .then(() => {})
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
  saveEditedMessage(messageId: string): void {
    const editedText = this.editedMessage[messageId];
    if (!this.privateMessageId || !messageId) {
      console.error('Missing required IDs for updating message.');
      return;
    }
    const messageRef = doc(
      this.firestore,
      `privateMessages/${this.privateMessageId}/messages/${messageId}`
    );

    setDoc(messageRef, { message: editedText.split('\n') }, { merge: true })
      .then(() => {
        this.isEditEnabled[messageId] = false;
        this.isEditingEnabled[messageId] = false;
        this.editedMessage[messageId] = '';
      })
      .catch((error) => {
        console.error('Error updating message:', error);
      });
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
      panelClass: ['border', 'view-profile-popup']
    });
  }
}
