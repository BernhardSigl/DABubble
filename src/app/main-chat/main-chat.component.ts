import { Component, OnInit, ViewChild } from '@angular/core';
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
import { AuthyService } from '../firebase-services/authy.service';
import { Message } from '../classes/message.class';
import { FirebaseService } from '../firebase-services/firebase.service';
import { AddMembersRetrospectivelyComponent } from '../popup/add-members-retrospectively/add-members-retrospectively.component';
import { MatDialog } from '@angular/material/dialog';
import { ListMembersComponent } from '../popup/list-members/list-members.component';
import { EditChannelComponent } from '../popup/edit-channel/edit-channel.component';
import { Observable } from 'rxjs';

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
    EditChannelComponent
  ],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss',
})
export class MainChatComponent implements OnInit {

  userName: string = '';
  userImage: string = '';
  userId: string = '';
  selectedMessage: Message | null = null;
  @ViewChild(MessageLayoutComponent)
  messageLayout!: MessageLayoutComponent;
  messages$: Observable<Message[]> | undefined;

  constructor(
    private userDataService: UserListService,
    private auth: AuthyService,
    public firebase: FirebaseService,
    public dialog: MatDialog
    ) { }

  onMessageSelected(message: Message): void {
    this.selectedMessage = message;
  }

  async ngOnInit(): Promise<void>{
    await this.firebase.ngOnInit();
    this.userId = this.firebase.loggedInUserId;
    this.getUserData(this.userId);

    // important for email change
    const emailForSignIn = window.localStorage.getItem('emailForSignIn');
    if (emailForSignIn) {
      this.auth.completeEmailChange();
    }
    if (this.messageLayout) {
      this.messages$ = this.messageLayout.messages$;
    }
  }

  async getUserData(userId: string): Promise<void> {
    await this.userDataService.fetchUserData(userId);
    this.userDataService.userName$.subscribe(userName => {
      this.userName = userName;
    });
    this.userDataService.userImage$.subscribe(userImage => {
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
}
