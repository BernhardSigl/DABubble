import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  NgZone,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { MessageBoxComponent } from './message-box/message-box.component';
import { FormsModule } from '@angular/forms';
import { ThreadComponent } from './thread/thread.component';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule, Location } from '@angular/common';
import { MessageLayoutComponent } from './message-layout/message-layout.component';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { UserListService } from '../firebase-services/user-list.service';
import { AuthyService } from '../firebase-services/authy.service';
import { Message } from '../classes/message.class';
import { FirebaseService } from '../firebase-services/firebase.service';
import { AddMembersRetrospectivelyComponent } from '../popup/add-members-retrospectively/add-members-retrospectively.component';
import { MatDialog } from '@angular/material/dialog';
import { ListMembersComponent } from '../popup/list-members/list-members.component';
import { EditChannelComponent } from '../popup/edit-channel/edit-channel.component';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-main-chat',
  standalone: true,
  imports: [
    MatCardModule,
    HeaderComponent,
    SideNavComponent,
    MessageBoxComponent,
    FormsModule,
    ThreadComponent,
    CommonModule,
    MatDividerModule,
    MessageLayoutComponent,
    AngularFirestoreModule,
    AddMembersRetrospectivelyComponent,
    ListMembersComponent,
    EditChannelComponent,
  ],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss',
})
export class MainChatComponent implements OnInit {
  @ViewChild('scrollContainer') scrollContainer: ElementRef | undefined;
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @Output() scrollToBottomEvent: EventEmitter<void> = new EventEmitter<void>();

  userName: string = '';
  userImage: string = '';
  userId: string = '';
  selectedMessage: Message | null = null;
  @ViewChild(MessageLayoutComponent)
  messageLayout!: MessageLayoutComponent;
  messages$: Observable<Message[]> | undefined;

  startTime!: number;
  initTime!: number;
  loadTime!: number;

  constructor(
    private userDataService: UserListService,
    private auth: AuthyService,
    public firebase: FirebaseService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {
    this.startTime = window.performance.now();
  }

  onMessageSelected(message: Message): void {
    this.selectedMessage = message;
  }

  async ngOnInit(): Promise<void> {   
    // this.hideChatDuringLoad('hidden');
    // performance test: alt
    await this.firebase.pullLoggedInUserId(); // performance test: neu

    this.userId = this.firebase.loggedInUserId;
    await this.getUserData(this.userId);
    if (this.messageLayout) {
      this.messages$ = this.messageLayout.messages$;
    }
    this.checkLoadingTime();
    await this.waitForScroll();
    // this.hideChatDuringLoad('visible');
    this.firebase.scheduleAutomaticUpdate();
    this.checkEmailChange();
  }

  checkLoadingTime() {
    this.initTime = window.performance.now();
    this.printTime(this.initTime);
  }

  async waitForScroll(): Promise<void> {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        this.scrollToBottom();
        resolve();
      }, this.loadTime);
    });
  }

  hideChatDuringLoad(visibilty: string) {
    const chats = document.getElementById('message-box-id');    
    if (chats) {
      chats.style.visibility = visibilty;
    }
  }

  async printTime(time: number) {
    this.loadTime = time + time - this.startTime;
  }

  async scrollToBottom() {
    try {
      const messageLayoutElement = this.messageLayout?.getNativeElement();

      if (messageLayoutElement) {
        messageLayoutElement.scrollTop = messageLayoutElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  async getUserData(userId: string): Promise<void> {
    await this.userDataService.fetchUserData(userId);
    this.userDataService.userName$.subscribe((userName) => {
      this.userName = userName;
    });
    this.userDataService.userImage$.subscribe((userImage) => {
      this.userImage = userImage;
    });
  }

  addMemberDropdown() {
    this.dialog.open(AddMembersRetrospectivelyComponent, {
      position: { top: '210px', right: '550px' },
      panelClass: 'no-border-tr',
    });
  }

  listMembers() {
    this.dialog.open(ListMembersComponent, {
      position: { top: '210px', right: '650px' },
      panelClass: 'no-border-tr',
    });
  }

  showChannelInfo() {
    this.dialog.open(EditChannelComponent, {
      position: { top: '210px', right: '500px' },
      panelClass: 'no-border-tl',
    });
  }

  async checkEmailChange() {
    this.route.queryParams.subscribe(async (params) => {
      const userIdParam = params['userId'];
      if (userIdParam && userIdParam.endsWith('_email')) {
        await this.firebase.ngOnInit();
        const inputEmail = localStorage.getItem('inputEmail');
        if (inputEmail) {
          await this.firebase.changeEmail(inputEmail);
          localStorage.removeItem('inputEmail');
          this.router.navigate(['/main'], {
            queryParams: { userId: this.firebase.loggedInUserId },
          });
          this.reloadPage();
        }
      }
    });
  }

  reloadPage(): void {
    window.location.reload();
  }
}
