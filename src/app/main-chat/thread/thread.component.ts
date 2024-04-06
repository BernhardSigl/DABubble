import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { MessageBoxComponent } from '../message-box/message-box.component';
import { MessageLayoutComponent } from '../message-layout/message-layout.component';
import { MessageLayoutThreadComponent } from '../message-layout-thread/message-layout-thread.component';
import { Message } from '../../classes/message.class';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSidenavModule } from '@angular/material/sidenav';
import { DrawerService } from '../../firebase-services/drawer.service';
import { MessageBoxThreadComponent } from './message-box-thread/message-box-thread.component';
import { MessageServiceService } from '../../firebase-services/message-service.service';
import { FirebaseService } from '../../firebase-services/firebase.service';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [
    MessageBoxComponent,
    MessageLayoutComponent,
    MessageLayoutThreadComponent,
    MatSidenavModule,
    MatDrawer,
    MessageBoxThreadComponent,
  ],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
})
export class ThreadComponent implements OnInit {
  @Input() userName!: string;
  @Input() userImage!: string;
  @Input() userId!: string;
  @Input() selectedMessage: Message | null = null;
  @ViewChild('drawer') drawer!: MatDrawer;
  threadMessages: string[] = [];
  isOpen = false;
  threadId: string = '';

  constructor(
    private drawerService: DrawerService,
    private el: ElementRef,
    private scrollHelper: MessageServiceService,
    public firebase: FirebaseService
  ) {}
  // *ngIf="drawerService.isOpen$ | async"
  async ngOnInit(): Promise<void> {
    this.drawerService.isOpen$.subscribe((isOpen) => {
      this.isOpen = isOpen;
      if (isOpen) {
        this.drawer.close();
        this.threadWindowBehaviour('open');
      } else {
        this.threadWindowBehaviour('close');
      }
    });
    await this.loadCurrentChannelName();
  }

  threadWindowBehaviour(openOrClosed: string) {
    const threadContentElement = document.getElementById('thread-content');
    if (openOrClosed === 'open' && threadContentElement) {
      threadContentElement.style.width = '386px';
      threadContentElement.style.zIndex = '0';
      localStorage.setItem('thread-status', 'open');
    } else if (openOrClosed === 'close' && threadContentElement) {
      threadContentElement.style.width = '0';
      threadContentElement.style.zIndex = '-1';
      localStorage.setItem('thread-status', 'closed');
    }
  }

  async loadCurrentChannelName() {
    await this.firebase.subAllUsers();
    await this.firebase.loggedInUserData();
    await this.firebase.selectLastOpenedChannel();
  }

  toggleThread(): void {
    this.drawerService.closeDrawer();
    localStorage.removeItem('threadMessage');
    localStorage.removeItem('threadMessageId');
    if (this.isOpen) {
      this.drawerService.setSideNavBtnStatus(false);
    }
  }

  sendMessage(message: string): void {
    this.threadMessages.push(message);
    // Emit an event to notify the parent component that a message has been sent
  }

  handleThreadId(threadId: string) {
    // Handle the received threadId here
    // You can use this threadId as needed in your component logic
    this.threadId = threadId;
  }
}
