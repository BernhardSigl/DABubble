import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { MessageBoxPcComponent } from './message-box-pc/message-box-pc.component';
import { MessageLayoutPcComponent } from './message-layout-pc/message-layout-pc.component';
import { PrivateMessageService } from '../firebase-services/private-message.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Message } from '../classes/message.class';
import { FirebaseService } from '../firebase-services/firebase.service';
import { MatDialog } from '@angular/material/dialog';
import { ViewSpecificProfileComponent } from '../popup/view-specific-profile/view-specific-profile.component';
import { MessageServiceService } from '../firebase-services/message-service.service';

@Component({
  selector: 'app-private-chat',
  standalone: true,
  imports: [
    HeaderComponent,
    SideNavComponent,
    MessageBoxPcComponent,
    MessageLayoutPcComponent,
    CommonModule,
  ],
  templateUrl: './private-chat.component.html',
  styleUrl: './private-chat.component.scss',
})
export class PrivateChatComponent implements OnInit, AfterViewInit {
  @ViewChild(MessageLayoutPcComponent)
  messageLayoutPC!: MessageLayoutPcComponent;

  selectedUserName: string = '';
  selectedUserImage: string = '';
  selectedUserStatus!: boolean;
  userId: string = '';

  constructor(
    public privateMessageService: PrivateMessageService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private firebase: FirebaseService,
    public dialog: MatDialog,
    private scrollHelper: MessageServiceService
  ) {}
  messages$: Observable<Message[]> | undefined;

  async ngOnInit(): Promise<void> {
    this.subScrollEvent();
    this.subscribeToSelectedUser();
  }

  subScrollEvent() {
    this.scrollHelper.scrollEventPrivateChat.subscribe(() => {
      this.scrollToBottom();
    });
  }

  async scrollToBottom() {
    try {
      const messageLayoutElement = this.messageLayoutPC?.getNativeElement();
      messageLayoutElement.scrollTop = messageLayoutElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  // async waitForScroll(): Promise<void> {
    
  //   this.scrollHelper.calc('privateChat');
  //   setTimeout(() => {
  //     this.scrollToBottom();
  //   }, this.scrollHelper.loadTime);
  // }

  ngAfterViewInit(): void {
    if (this.messageLayoutPC) {
      this.messages$ = this.messageLayoutPC.messages$;
      this.cdr.detectChanges();
    }
    // this.waitForScroll();
    // console.log('test');
    
  }

  subscribeToSelectedUser() {
    this.privateMessageService.selectedUser$.subscribe((data) => {
      if (data) {
        this.selectedUserName = data.user.name;
        this.selectedUserImage = data.user.profileImg;
        this.selectedUserStatus = data.user.status;
      }
    });
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
