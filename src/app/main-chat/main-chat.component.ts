import {
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { MessageBoxComponent } from './message-box/message-box.component';
import { FormsModule } from '@angular/forms';
import { ThreadComponent } from './thread/thread.component';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { MessageLayoutComponent } from './message-layout/message-layout.component';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { UserListService } from '../firebase-services/user-list.service';
import { Message } from '../classes/message.class';
import { FirebaseService } from '../firebase-services/firebase.service';
import { AddMembersRetrospectivelyComponent } from '../popup/add-members-retrospectively/add-members-retrospectively.component';
import { MatDialog } from '@angular/material/dialog';
import { ListMembersComponent } from '../popup/list-members/list-members.component';
import { EditChannelComponent } from '../popup/edit-channel/edit-channel.component';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageServiceService } from '../firebase-services/message-service.service';
import { DrawerService } from '../firebase-services/drawer.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    MatProgressSpinnerModule
  ],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss',
})
export class MainChatComponent implements OnInit {
  userName: string = '';
  userImage: string = '';
  userId: string = '';
  selectedMessage: Message | null = null;
  messages$: Observable<Message[]> | undefined;
  @ViewChild(MessageLayoutComponent)
  messageLayout!: MessageLayoutComponent;
  isLoading: boolean = true;
  public windowWidth!: number;

  constructor(
    private userDataService: UserListService,
    public firebase: FirebaseService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private scrollHelper: MessageServiceService,
    public drawerService: DrawerService
  ) {}

  onMessageSelected(message: Message): void {
    this.selectedMessage = message;
  }

  async ngOnInit(): Promise<void> {
    this.subScrollEvent();
    await this.firebase.pullLoggedInUserId();
    this.userId = this.firebase.loggedInUserId;

    await this.getUserData(this.userId);
    if (this.messageLayout) {
      this.messages$ = this.messageLayout.messages$;
    }
    this.firebase.scheduleAutomaticUpdate();
    this.checkEmailChange();
    this.isLoading = false;
  }

  subScrollEvent() {
    this.scrollHelper.scrollEventChannel.subscribe(() => {
      this.scrollToBottom();
    });
  }

  hideChatDuringLoad(visibilty: string) {
    const chats = document.getElementById('message-box-id');
    if (chats) {
      chats.style.visibility = visibilty;
    }
  }

  scrollToBottom() {
    try {
      const messageLayoutElement = this.messageLayout?.getNativeElement();
      messageLayoutElement.scrollTop = messageLayoutElement.scrollHeight;
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
      position: { top: '215px' },
      panelClass: ['no-border-tr', 'addMembersRetrospectivePopup'],
    });
  }

  listMembers() {
    this.dialog.open(ListMembersComponent, {
      panelClass: ['no-border-tr', 'list-members-main-dialog'],
    });
  }

  showChannelInfo() {
    this.dialog.open(EditChannelComponent, {
      panelClass: ['editChannelPopup'],
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
