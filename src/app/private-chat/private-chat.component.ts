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
  selectedUserName: string = '';
  selectedUserImage: string = '';

  userId: string = '';
  constructor(
    private privateMessageService: PrivateMessageService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private firebase: FirebaseService,
    public dialog: MatDialog
  ) {}
  @ViewChild(MessageLayoutPcComponent)
  messageLayoutPC!: MessageLayoutPcComponent;
  messages$: Observable<Message[]> | undefined;

  ngOnInit(): void {
    this.subscribeToSelectedUser();
  }
  ngAfterViewInit(): void {
    if (this.messageLayoutPC) {
      this.messages$ = this.messageLayoutPC.messages$;
      this.cdr.detectChanges();
    }
  }

  subscribeToSelectedUser() {
    this.privateMessageService.selectedUser$.subscribe((data) => {
      if (data) {
        this.selectedUserName = data.user.name;
        this.selectedUserImage = data.user.profileImg;
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
